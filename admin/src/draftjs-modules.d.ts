declare module 'draftjs-to-html' {
  import { RawDraftContentState } from 'draft-js'
  function draftToHtml(
    editorContent: RawDraftContentState,
    hashtagConfig?: { trigger?: string; separator?: string },
    directional?: boolean,
    customEntityTransform?: (...args: unknown[]) => unknown
  ): string
  export default draftToHtml
}

declare module 'html-to-draftjs' {
  import { ContentBlock, RawDraftEntity } from 'draft-js'
  function htmlToDraft(
    text: string,
    customChunkRenderer?: (
      nodeName: string,
      node: HTMLElement
    ) => RawDraftEntity | undefined
  ): { contentBlocks: ContentBlock[]; entityMap?: unknown }
  export default htmlToDraft
}
