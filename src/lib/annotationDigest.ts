import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { LibraryDocument } from '@/src/types';

function cleanHeading(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export function createStarredAnnotationDigest(documents: LibraryDocument[]): string {
  const sections = documents
    .map((document) => ({
      name: cleanHeading(document.name),
      annotations: (document.annotations ?? [])
        .filter((annotation) => annotation.starred)
        .sort((a, b) => a.page - b.page),
    }))
    .filter((document) => document.annotations.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!sections.length) throw new Error('Star at least one annotation before creating a digest.');

  const body = sections.map((document) => {
    const notes = document.annotations.map((annotation) => {
      const heading = `### Page ${annotation.page} · ${annotation.color} highlight`;
      const note = annotation.note.trim()
        ? annotation.note.trim().split(/\r?\n/).map((line) => `> ${line}`).join('\n')
        : '> Highlighted page';
      return `${heading}\n\n${note}`;
    }).join('\n\n');
    return `## ${document.name}\n\n${notes}`;
  }).join('\n\n---\n\n');

  return [
    '# Aado starred annotations',
    '',
    `Created ${new Date().toLocaleDateString()}`,
    '',
    body,
    '',
  ].join('\n');
}

export async function shareStarredAnnotationDigest(documents: LibraryDocument[]): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('File sharing is not available on this device.');
  }
  const markdown = createStarredAnnotationDigest(documents);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = new File(Paths.cache, `aado-starred-annotations-${timestamp}.md`);
  file.create();
  file.write(markdown);
  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Share starred annotations',
    mimeType: 'text/markdown',
    UTI: 'net.daringfireball.markdown',
  });
}
