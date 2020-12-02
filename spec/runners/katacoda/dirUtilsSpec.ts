import 'jasmine'; 
import { DirUtils } from '../../../runners/katacoda/dirUtils';

describe("DirUtils", () => {
  let target = new DirUtils();
  describe("changeCurrentDir", () => {
    it("is already in the right folder", () => {
      expect(target.getCdParam('/root', '/root')).toBe('');
    });
    it("changes directly to the child folder, because currentDir is the prefix of dir", () => {
      expect(target.getCdParam('/root/devonfw', '/root/devonfw/setup')).toBe('setup');
    });
    it("returns an absolute path, because both dirs don't have matching parent folders", () => {
      expect(target.getCdParam('/setup', '/root/devonfw/setup')).toBe('/root/devonfw/setup');
    });
    it("changes to parent folder before changing to child folder", () => {
      expect(target.getCdParam('/root/devonfw', '/root/setup/folder0/folder1')).toBe('../setup/folder0/folder1');
    });
    it("changes to parent folder before changing to child folder and one child folder has the same position and name", () => {
      expect(target.getCdParam('/root/devonfw/folder/setup', '/root/devonfw/setup/setup')).toBe('../../setup/setup');
    });

  });
});
