"use client";

import Popover from './Popover';

/**
 * A reusable popover menu component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the menu is open
 * @param {function} props.onClose - Callback when the menu is closed
 * @param {string} props.anchorId - ID of the element the menu is anchored to
 * @param {Array} props.menuItems - Array of menu items with label and onClick properties
 */
export default function PopoverMenu({
  open,
  onClose,
  anchorId,
  menuItems = [],
  position = 'right', // 'right', 'left', 'top', 'bottom'
}) {
  if (menuItems.length === 0) return null;
  
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorId={anchorId}
      position={position}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-md cursor-pointer font-medium"
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