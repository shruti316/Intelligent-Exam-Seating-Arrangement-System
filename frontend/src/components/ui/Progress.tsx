interface Props {
  value: number;
}

export default function Progress({
  value,
}: Props) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#E7DDD5]">

      <div
        className="h-full rounded-full bg-[#2F3E46] transition-all duration-500"
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      />

    </div>
  );
}