import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/content";
import type { BuyerMessages } from "@/modules/buyer/messages";

/** Designed gate for the three session-scoped buyer pages; no data is fetched when it renders. */
export function SignInRequired({
  messages,
  loginHref,
  homeHref,
}: {
  messages: BuyerMessages;
  loginHref: string;
  homeHref: string;
}) {
  return (
    <div className="container-page max-w-2xl py-16 md:py-24">
      <EmptyState
        title={messages.common.signInRequiredTitle}
        description={messages.common.signInRequiredBody}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={loginHref}>{messages.common.signInCta}</ButtonLink>
            <ButtonLink href={homeHref} variant="secondary">
              {messages.common.backHome}
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
