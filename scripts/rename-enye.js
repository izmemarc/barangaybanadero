const fs = require('fs')
const path = require('path')

// Get directory from command line argument or use current directory
const targetDir = process.argv[2] || process.cwd()

console.log(`Renaming files in: ${targetDir}`)

function renameFile(filePath) {
  const dir = path.dirname(filePath)
  const oldName = path.basename(filePath)
  
  // Replace ñ and Ñ with N
  const newName = oldName
    .replace(/ñ/g, 'N')
    .replace(/Ñ/g, 'N')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove other diacritics
  
  if (oldName !== newName) {
    const newPath = path.join(dir, newName)
    fs.renameSync(filePath, newPath)
    console.log(`Renamed: ${oldName} → ${newName}`)
    return true
  }
  return false
}

function processDirectory(dir) {
  // Skip system directories
  const skipDirs = ['node_modules', '.git', '.next', '.turbo', 'dist', 'build']
  const dirName = path.basename(dir)
  if (skipDirs.includes(dirName)) {
    return 0
  }
  
  const files = fs.readdirSync(dir)
  let renamedCount = 0
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    
    try {
      const stat = fs.statSync(filePath)
      
      if (stat.isFile()) {
        // Only process image files
        const ext = path.extname(file).toLowerCase()
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          if (renameFile(filePath)) {
            renamedCount++
          }
        }
      } else if (stat.isDirectory()) {
        const subCount = processDirectory(filePath)
        renamedCount += subCount
      }
    } catch (error) {
      // Skip files that can't be accessed
      continue
    }
  }
  
  return renamedCount
}

try {
  const count = processDirectory(targetDir)
  console.log(`\nDone! Renamed ${count} file(s).`)
} catch (error) {
  console.error('Error:', error.message)
  process.exit(1)
}
