<?php

declare(strict_types=1);

namespace Lueg\SitePackage\EventListener;

use In2code\Powermail\Events\SendMailServicePrepareAndSendEvent;
use Symfony\Component\Mime\Address;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Sends the applicant-notification mail (Powermail "receiver" mail) FROM our own
 * domain instead of from the applicant's address.
 *
 * Why: by default Powermail puts the applicant's e-mail into the From header, so
 * Gmail & co. flag the mail as spoofed — it is sent by the host's server
 * (tajo.host.ch) but claims to come from e.g. @gmail.com, which fails SPF/DMARC.
 * We rewrite From to our own domain and keep the applicant as Reply-To, so the
 * team can still just hit "Reply" to answer the applicant directly.
 *
 * Why in PHP and not via plugin.tx_powermail...receiver.overwrite: the
 * flexform-configured form drops that TypoScript overwrite subtree before it
 * reaches the mail service (SendMailService::$overwriteConfig stays null), so a
 * TypoScript or constant override never takes effect. This event fires as the
 * last step before the message is sent, so it reliably has the final word.
 *
 * NOTE: this only fixes the visible From. For the mail to actually pass the
 * receiving server's checks, luegjobs.ch must authorise the sending host to send
 * on its behalf — SPF (and ideally DKIM) for luegjobs.ch at the host (host.ch).
 */
#[AsEventListener('lueg/powermail-receiver-mail-from')]
final class PowermailReceiverMailFrom
{
    private const FROM_EMAIL = 'noreply@luegjobs.ch';
    private const FROM_NAME = 'Spitex Region Lueg';

    public function __invoke(SendMailServicePrepareAndSendEvent $event): void
    {
        $email = $event->getEmail();

        // Only the receiver mail (notification to the company) — never a possible
        // confirmation / opt-in mail addressed to the applicant.
        if (($email['template'] ?? '') !== 'Mail/ReceiverMail') {
            return;
        }

        $message = $event->getMailMessage();

        // Reply-To = the applicant. Powermail prefills senderEmail/senderName (and
        // replyToEmail) with the applicant's data, so read it back from there.
        $applicantEmail = (string)($email['replyToEmail'] ?? $email['senderEmail'] ?? '');
        $applicantName = (string)($email['replyToName'] ?? $email['senderName'] ?? '');
        if (GeneralUtility::validEmail($applicantEmail)) {
            $message->replyTo(new Address(
                $applicantEmail,
                $applicantName !== '' ? $applicantName : $applicantEmail
            ));
        }

        // From = our own domain (so SPF/DKIM for luegjobs.ch can authenticate it).
        $message->from(new Address(self::FROM_EMAIL, self::FROM_NAME));

        // Drop any Sender: header that might still expose the applicant's address.
        $headers = $message->getHeaders();
        if ($headers->has('Sender')) {
            $headers->remove('Sender');
        }
    }
}
