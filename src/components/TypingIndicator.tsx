import { memo } from "react";

const TypingIndicator = memo(({ name }: { name?: string }) => (
  <div className="flex items-start gap-1">
    <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">{name || "Someone"} is typing</span>
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
