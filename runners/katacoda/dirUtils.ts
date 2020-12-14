import * as path from 'path';

export class DirUtils{

    getCdParam(currentDir:string, targetDir:string):string{
        
        //returns an empty string, if both variables have the same path 
        if(currentDir == targetDir){
            return "";
        }
             
        let dirPath = "";

        let currentPaths = currentDir.split(path.sep);
        let targetPaths = targetDir.split(path.sep);
        
        let index;
        let isEqual = true;
         
        //saves the remaining path, if currentdir is the prefix of targetDir
        if(targetDir.substring(0,currentDir.length) == currentDir){
            return path.join(targetDir.replace(currentDir + path.sep, '')).replace(/\\/g, "/");
        }


        else{
            //returns the absolut directory, if the first parent folder is different
            if(currentPaths[1] != targetPaths[1]){
                return targetDir.replace(/\\/g, "/");
            }
            
            //iterates throught currentPath array to compare parent directories
            currentPaths.forEach((currentPath, i) => {
                if(currentPath == targetPaths[i] && isEqual == true){
                    index = i;
                }else{
                    isEqual = false;
                    dirPath = path.join(dirPath,'..');
                }
            })

            //slice targetPaths to get the relative path
            targetPaths = targetPaths.slice(index + 1, targetPaths.length);
        
            return path.join(dirPath, targetPaths.join(path.sep)).replace(/\\/g, "/");
            
        }

    }

}