export default function CityBackdrop() {
  return (
    <img
      className="mission-backdrop mission-backdrop--district"
      src={`${import.meta.env.BASE_URL}world/district-poster.webp`}
      width="1440"
      height="900"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
}
