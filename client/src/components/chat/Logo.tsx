import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  title?: string;
}

export default function Logo({
  className,
  title = "NeverminedPay",
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="33"
        height="20"
        viewBox="0 0 33 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.8683 19.9002L0 10.0011V0L10.8683 9.89908V19.9002Z"
          fill="currentColor"
        ></path>
        <path
          d="M21.7369 19.9002L10.8686 10.0011V0L21.7369 9.89908L32.404 0V10.0011L21.7369 19.9002Z"
          fill="currentColor"
        ></path>
      </svg>
      <span className="text-lg" style={{ color: "#0D3F48" }}>
        <strong>Nevermined</strong>
        <span className="font-normal">Pay</span>
      </span>
    </div>
  );
}
