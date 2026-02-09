function buildSummary(diagramHints) {
  if (!diagramHints) {
    return 'No diagram available.';
  }
  const nodes = diagramHints.nodes || [];
  const edges = diagramHints.edges || [];
  const nodeText = nodes.length ? `Nodes: ${nodes.join(', ')}` : 'No nodes provided';
  const edgeText = edges.length ? `Edges: ${edges.join(', ')}` : 'No edges provided';
  return `${nodeText}. ${edgeText}.`;
}

function layoutNodes(nodes) {
  const count = nodes.length;
  const width = 600;
  const height = 200;
  const padding = 60;
  const available = width - padding * 2;
  const spacing = count > 1 ? available / (count - 1) : 0;
  return nodes.map((label, index) => ({
    label,
    x: padding + index * spacing,
    y: height / 2
  }));
}

export function createDiagramRenderer({ diagramHints, title }) {
  const wrapper = document.createElement('section');
  wrapper.className = 'mt-6 app-card p-5';

  const header = document.createElement('div');
  header.className = 'flex flex-wrap items-center justify-between gap-3';

  const label = document.createElement('p');
  label.className = 'text-xs font-semibold uppercase tracking-[0.2em] app-muted';
  label.textContent = 'Diagram';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'app-button-outline px-3 py-1 text-xs font-semibold uppercase tracking-wide app-focus';
  toggle.textContent = 'Minimal';

  header.append(label, toggle);

  const summary = document.createElement('p');
  summary.className = 'app-sr-only';
  summary.id = `diagram-summary-${title?.toLowerCase().replace(/\s+/g, '-') || 'question'}`;
  summary.textContent = buildSummary(diagramHints);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 600 200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-describedby', summary.id);
  svg.classList.add('app-diagram');

  const nodes = diagramHints?.nodes || [];
  const edges = diagramHints?.edges || [];
  const positions = layoutNodes(nodes);
  const isCircle = ['graph', 'funnel'].includes(diagramHints?.shape || '');

  positions.forEach((node, index) => {
    if (index < positions.length - 1) {
      const next = positions[index + 1];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node.x);
      line.setAttribute('y1', node.y);
      line.setAttribute('x2', next.x);
      line.setAttribute('y2', next.y);
      line.setAttribute('class', 'app-diagram-line');
      svg.append(line);

      if (edges[index]) {
        const edgeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        edgeLabel.setAttribute('x', (node.x + next.x) / 2);
        edgeLabel.setAttribute('y', node.y - 16);
        edgeLabel.setAttribute('text-anchor', 'middle');
        edgeLabel.setAttribute('class', 'app-diagram-label');
        edgeLabel.textContent = edges[index];
        svg.append(edgeLabel);
      }
    }
  });

  positions.forEach((node) => {
    if (isCircle) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', '26');
      circle.setAttribute('class', 'app-diagram-node');
      svg.append(circle);
    } else {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x - 40);
      rect.setAttribute('y', node.y - 24);
      rect.setAttribute('width', '80');
      rect.setAttribute('height', '48');
      rect.setAttribute('rx', '16');
      rect.setAttribute('class', 'app-diagram-node');
      svg.append(rect);
    }

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'app-diagram-text');
    text.textContent = node.label;
    svg.append(text);
  });

  const content = document.createElement('div');
  content.className = 'mt-4 app-diagram-shell';
  content.append(svg, summary);

  let mode = 'schematic';

  function updateMode() {
    const isMinimal = mode === 'minimal';
    svg.classList.toggle('app-diagram--minimal', isMinimal);
    toggle.textContent = isMinimal ? 'Schematic' : 'Minimal';
  }

  toggle.addEventListener('click', () => {
    mode = mode === 'schematic' ? 'minimal' : 'schematic';
    updateMode();
  });

  updateMode();

  wrapper.append(header, content);

  return {
    element: wrapper
  };
}
