import { JSX, ReactNode } from "react";

interface IProps {
  href: string;
  className?: string;
  children: ReactNode;
  name: string;
}

export function InternalLink(props: IProps): JSX.Element {
  return (
    <a
      href={props.href}
      target="_blank"
      className={props.className}
    >
      {props.children}
    </a>
  );
}
