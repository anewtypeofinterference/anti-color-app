// app/components/ColorTile.js
import Link from "next/link";

function cmykToRgb(c, m, y, k) {
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return { r, g, b };
}

export default function ColorTile({ color }) {
  const { c, m, y, k, name, id } = color;
  const { r, g, b } = cmykToRgb(c, m, y, k);

  return (
    <Link href={`/${id}`} passHref>
      <div className="flex flex-col items-center p-4 border border-gray-300 rounded-md shadow-md hover:shadow-lg cursor-pointer">
        <div
          className="w-32 h-32 mb-4 rounded-md"
          style={{
            backgroundColor: `rgb(${r}, ${g}, ${b})`, // Base color preview
          }}
        ></div>
        <div className="text-center">
          <h3 className="text-lg">{name}</h3>
          <p className="text-sm">CMYK: {c}% {m}% {y}% {k}%</p>
        </div>
      </div>
    </Link>
  );
}
