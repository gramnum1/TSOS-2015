dir *.ts /b /s > ts-files.txt
tsc @ts-files.txt -rootDir source  -outDir distrib 
del ts-files.txt