import { captureRejectionSymbol } from "events";
import * as path from 'path';

export class DirUtils{

    getCdParam(currentDir:string, dir:string):string{

        //cd-Parameter
        let dirPath = "";

        let currentPaths = currentDir.split('/');
        let dirPaths = dir.split('/');
        
        let index;
        let isEqual = true;

        //returns an empty string, if both variables have the same path 
        if(currentDir == dir){
            return "";
        }
         
        //saves the remaining path, if currentdir is the prefix of dir
        if(dir.substring(0,currentDir.length) == currentDir){
            return dir.replace(currentDir.concat('/'), '');
        }

        else{
            //returns the absolut directory, if the first parent folder is different
            if(currentPaths[1] != dirPaths[1]){
                return dir;
            }
            
            //iterates throught currentPath array to compare parent directories
            currentPaths.forEach((currentPath, i) => {
                if(currentPath == dirPaths[i] && isEqual == true){
                    index = i;
                }else{
                    isEqual = false;
                    dirPath = dirPath.concat('../');
                }
            })

            //slice dirPaths to get the relative path
            dirPaths = dirPaths.slice(index + 1, dirPaths.length);
        
            return dirPath.concat(dirPaths.join('/'));
            
        }

    }

}