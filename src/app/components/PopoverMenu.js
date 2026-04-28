"use client";
import Popover from "./Popover";

export default function PopoverMenu({
  open,
  onClose,
  anchorId,
  menuItems = [],
  position = "right",
}) {
  if (menuItems.length === 0) return null;

  return (
    <Popover open={open} onClose={onClose} anchorId={anchorId} position={position}>
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-3 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-sm cursor-pointer text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => {
            item.onClick();
            if (item.closeOnClick !== false) {
              onClose();
            }
          }}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </Popover>
  );
}
