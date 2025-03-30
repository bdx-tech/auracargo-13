
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/85 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-kargon-red group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: 
            "group-[.toaster]:bg-green-500/85 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-white group-[.toaster]:border-green-500/20",
          error: 
            "group-[.toaster]:bg-red-500/85 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-white group-[.toaster]:border-red-500/20",
          warning: 
            "group-[.toaster]:bg-amber-500/85 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-white group-[.toaster]:border-amber-500/20",
          info: 
            "group-[.toaster]:bg-kargon-blue/85 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-white group-[.toaster]:border-kargon-blue/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
