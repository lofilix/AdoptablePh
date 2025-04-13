export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-14 md:flex-row md:justify-between">
        <p className="text-sm leading-loose text-center text-muted-foreground md:text-left">
          Built with ❤️ for animals in need. © {new Date().getFullYear()} AdoptablePH
        </p>
      </div>
    </footer>
  )
} 