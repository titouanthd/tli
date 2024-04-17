import * as fs from 'fs';

export default class FolderManagerService {
    public static createFolder(folderPath: string): void {
        console.log(`Creating folder: ${folderPath}`);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {
                recursive: true,
            });
        }
    }

    public static deleteFolder(folderPath: string): void {
        console.log(`Deleting folder: ${folderPath}`);
        if (fs.existsSync(folderPath)) {
            fs.rmdirSync(folderPath, {
                recursive: true,
            });
        }
    }

    public static moveFolder(source: string, destination: string): void {
        console.log(`Moving folder from ${source} to ${destination}`);
        fs.renameSync(source, destination);
    }

    public static listFolder(folderPath: string): void {
        console.log(`Listing folder: ${folderPath}`);
        fs.readdirSync(folderPath).forEach((file) => {
            console.log(file);
        });
    }

    public static createFile(filePath: string, content: string): void {
        console.log(`Creating file: ${filePath}`);
        fs.writeFileSync(filePath, content);
    }

    public static deleteFile(filePath: string): void {
        console.log(`Deleting file: ${filePath}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    public static getFileContent(filePath: string): string {
        console.log(`Getting file content: ${filePath}`);
        return fs.readFileSync(filePath, 'utf8');
    }

    // check if a file exists
    public static fileExists(filePath: string): boolean {
        console.log(`Checking if file exists: ${filePath}`);
        return fs.existsSync(filePath);
    }
}
