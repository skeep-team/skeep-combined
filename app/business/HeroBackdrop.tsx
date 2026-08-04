type HeroBackdropProps = {
  className?: string;
  sources: string[];
};

/* 크로스페이드는 HeroIntro.module.css의 .backdrop img (:nth-child 딜레이 포함)
   키프레임이 전부 맡는다. 여기서는 순서대로 이미지를 깔아주기만 하면 된다. */
export default function HeroBackdrop({ className, sources }: HeroBackdropProps) {
  return (
    <div className={className}>
      {sources.map((src) => (
        <img key={src} src={src} alt="" aria-hidden="true" />
      ))}
    </div>
  );
}
