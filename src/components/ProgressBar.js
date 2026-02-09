export function createProgressBar({ current, total }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mt-6 app-card p-4';

  const label = document.createElement('div');
  label.className = 'flex items-center justify-between text-sm app-muted';
  label.innerHTML = `<span>Progress</span><span>${current}/${total}</span>`;

  const track = document.createElement('div');
  track.className = 'mt-3 h-2 w-full overflow-hidden rounded-full app-track';

  const bar = document.createElement('div');
  bar.className = 'h-full rounded-full app-accent transition';
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
  bar.style.width = `${percent}%`;
  bar.setAttribute('aria-hidden', 'true');

  track.append(bar);
  wrapper.append(label, track);

  return wrapper;
}
