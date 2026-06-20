type Listener = () => void;

const homeScrollListeners = new Set<Listener>();

export function emitHomeScrollToTop() {
  homeScrollListeners.forEach((listener) => listener());
}

export function subscribeHomeScrollToTop(listener: Listener) {
  homeScrollListeners.add(listener);

  return () => {
    homeScrollListeners.delete(listener);
  };
}
