import FolderManagerService from '../../services/FolderManagerService';
import fs from 'fs';

describe('FolderManagerService', () => {
    describe('createFolder / deleteFolder', () => {
        it('should create a folder', async () => {
            const tmpFolder = 'tmp';
            FolderManagerService.createFolder(tmpFolder);
            expect(fs.existsSync(tmpFolder)).toBe(true);
            FolderManagerService.deleteFolder(tmpFolder);
            expect(fs.existsSync(tmpFolder)).toBe(false);
        });
    });
    describe('moveFolder', () => {
        it('should move a folder', async () => {
            const source = 'source';
            const destination = 'destination';
            FolderManagerService.createFolder(source);
            FolderManagerService.moveFolder(source, destination);
            const exists = fs.existsSync(destination);
            expect(exists).toBe(true);
            FolderManagerService.deleteFolder(destination);
        });
    });
    describe('listFolder', () => {
        it('should list files in a folder', async () => {
            const folder = 'folder';
            FolderManagerService.createFolder(folder);
            const file = `${folder}/file.txt`;
            fs.writeFileSync(file, 'content');
            FolderManagerService.listFolder(folder);
            FolderManagerService.deleteFolder(folder);
        });
    });
    describe('createFile / deleteFile', () => {
        it('should create a file', async () => {
            const file = 'file.txt';
            FolderManagerService.createFile(file, 'content');
            expect(fs.existsSync(file)).toBe(true);
            FolderManagerService.deleteFile(file);
            expect(fs.existsSync(file)).toBe(false);
        });
    });
    describe('getFileContent', () => {
        it('should get the content of a file', async () => {
            const file = 'file.txt';
            FolderManagerService.createFile(file, 'content');
            const content = FolderManagerService.getFileContent(file);
            expect(content).toBe('content');
            FolderManagerService.deleteFile(file);
        });
    });
});
