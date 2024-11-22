import { Button } from "@/app/components/ui/button"
import { Twitter } from 'lucide-react'

interface TwitterShareButtonProps {
  text: string
  url?: string
  hashtags?: string[]
  via?: string
  className?: string
}

export function TwitterShareButton({
  text,
  url,
  hashtags,
  via,
  className,
}: TwitterShareButtonProps) {
  const twitterIntentUrl = new URL("https://twitter.com/intent/tweet")
  twitterIntentUrl.searchParams.append("text", text)
  
  if (url) twitterIntentUrl.searchParams.append("url", url)
  if (hashtags && hashtags.length > 0) twitterIntentUrl.searchParams.append("hashtags", hashtags.join(","))
  if (via) twitterIntentUrl.searchParams.append("via", via)
  // from 27 to 46 need to cut those characters.
  const taketout = twitterIntentUrl.searchParams.get("text")
  if (taketout) {
    const newText = taketout.slice(0, 28) + taketout.slice(74);
    twitterIntentUrl.searchParams.set("text", newText);
  }


  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => window.open(twitterIntentUrl.toString(), "_blank")}
      aria-label="Share on Twitter"
    >
      <Twitter className="mr-2 h-4 w-4" />
      Share on Twitter
    </Button>
  )
}


