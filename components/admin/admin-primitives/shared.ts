export function getHovered(state: { pressed: boolean } & Partial<{ hovered: boolean }>) {
  return Boolean(state.hovered);
}
