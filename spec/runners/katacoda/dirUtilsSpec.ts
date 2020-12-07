import 'jasmine';
import * as path from 'path';
import { DirUtils } from '../../../runners/katacoda/dirUtils';

describe("DirUtils", () => {
  let target = new DirUtils();
  describe("changeCurrentDir", () => {
    it("is already in the right folder", () => {
      expect(target.getCdParam(path.join('/root'), path.join('/root'))).toBe('');
    });
    it("changes directly to the child folder, because currentDir is the prefix of dir", () => {
      expect(target.getCdParam(path.join('/root/devonfw'), path.join('/root/devonfw/setup'))).toBe(path.join('setup'));
    });
    it("returns an absolute path, because both dirs don't have matching parent folders", () => {
      expect(target.getCdParam(path.join('/setup'), path.join('/root/devonfw/setup'))).toBe(path.join('/root/devonfw/setup'));
    });
    it("changes to parent folder before changing to child folder", () => {
      expect(target.getCdParam(path.join('/root/devonfw'), path.join('/root/setup/folder0/folder1'))).toBe(path.join('../setup/folder0/folder1'));
    });
    it("changes to parent folder before changing to child folder and one child folder has the same position and name", () => {
      expect(target.getCdParam(path.join('/root/devonfw/folder/setup'), path.join('/root/devonfw/setup/setup'))).toBe(path.join('../../setup/setup'));
    });

  });
});
