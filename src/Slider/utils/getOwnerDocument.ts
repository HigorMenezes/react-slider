export function getOwnerDocument(node: Node | null | undefined) {
  return (node && node.ownerDocument) || document;
}
