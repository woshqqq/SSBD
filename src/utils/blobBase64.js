// 백업 내보내기/가져오기는 JSON을 쓰는데 JSON은 Blob을 직접 담지 못한다.
// 그래서 내보낼 때는 Blob -> data URL(base64) 문자열로, 가져올 때는 반대로 되돌린다.
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:')
}

// 레코드 안의 지정된 필드들(Blob일 수 있는 필드)을 data URL로 바꾼 새 객체를 반환.
export async function blobFieldsToDataUrls(record, fields) {
  const next = { ...record }
  for (const field of fields) {
    if (next[field] instanceof Blob) {
      next[field] = await blobToDataUrl(next[field])
    }
  }
  return next
}

// 반대로 data URL 문자열을 다시 Blob으로 되돌린 새 객체를 반환.
export async function dataUrlFieldsToBlobs(record, fields) {
  const next = { ...record }
  for (const field of fields) {
    if (isDataUrl(next[field])) {
      next[field] = await dataUrlToBlob(next[field])
    }
  }
  return next
}
