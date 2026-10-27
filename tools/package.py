from pathlib import Path
import zipfile
root=Path(__file__).resolve().parent.parent
out=root/'The-Lion-Guard-Underground.zip'
folders=['assets','css','js','tools','tests','docs']
files=[root/p for p in ['index.html','README_RU.md','CREDITS_AND_LICENSES.md','TEST_REPORT.md','START_WINDOWS.bat','START_LINUX.sh','package.json','package-lock.json','.gitignore']]
for folder in folders:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file() and p.name!='model-data.js')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):z.write(p,Path('The-Lion-Guard-Underground')/p.relative_to(root))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert 'The-Lion-Guard-Underground/js/game.bundle.js' in z.namelist()
 print(f'{out.name}: {len(z.namelist())} files, {out.stat().st_size/1024/1024:.1f} MiB; archive CRC verified')
