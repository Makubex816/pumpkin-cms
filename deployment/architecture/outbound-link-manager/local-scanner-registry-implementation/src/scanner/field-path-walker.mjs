export function walkFixtureSources(fixture) {
  const sources = Array.isArray(fixture.sources) ? fixture.sources : [];
  return sources.flatMap((source, index) => walkSource(source, index));
}

function walkSource(source, sourceIndex) {
  const root = source.rootPath || `sources/${sourceIndex}/content`;
  const content = source.content ?? source;
  const context = {
    sourceIndex,
    sourceType: source.sourceType || source.content_type || 'fixture',
    page_id: source.page_id ?? source.pageId ?? null,
    content_type: source.content_type || source.sourceType || 'fixture',
    content_block_id: source.content_block_id ?? source.blockId ?? null
  };
  return walkValue(content, root, context, null);
}

function walkValue(value, currentPath, context, fieldName) {
  if (typeof value === 'string') {
    return [{
      value,
      path: currentPath,
      fieldName,
      context
    }];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => walkValue(item, `${currentPath}/${index}`, context, `${fieldName ?? 'items'}[${index}]`));
  }

  if (value && typeof value === 'object') {
    const nextContext = {
      ...context,
      page_id: value.page_id ?? value.pageId ?? context.page_id,
      content_type: value.content_type ?? value.type ?? context.content_type,
      content_block_id: value.content_block_id ?? value.blockId ?? value.id ?? context.content_block_id
    };
    return Object.entries(value).flatMap(([key, child]) => walkValue(child, `${currentPath}/${key}`, nextContext, key));
  }

  return [];
}
