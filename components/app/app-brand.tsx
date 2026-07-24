type AppBrandProps = {
  href?: string
  className?: string
  logoClassName?: string
}

export default function AppBrand({
  href = "/",
  className = "",
  logoClassName = "h-16 w-auto"
}: AppBrandProps) {
  return (
    <a href={href} className={`inline-flex items-center ${className}`}>
      <img
        src="/brand/qyg-isologotipo.png"
        alt="Quintas y Granjas"
        className={`${logoClassName} object-contain`}
      />
    </a>
  )
}
