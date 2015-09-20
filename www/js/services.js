angular.module('starter.services', [])

.factory('SqliteHelper', function ($rootScope, $cordovaSQLite) {
    function waitCopyDB(args) {
        if ($rootScope.isFinishCopyDB == false) {
            console.log("++++++++++++++waitCopyDB===================" + $rootScope.isFinishCopyDB);
            setTimeout(waitCopyDB, 100, args);
        }
        else {
            console.log("++++++++++++++waitCopyDB===================" + $rootScope.isFinishCopyDB);
            if (db == null) {
                console.log("++++++++++++++openDB===================");
                db = $cordovaSQLite.openDB("yfnd.db");
            }
            $cordovaSQLite.execute(db, args[0], args[1]).then(args[2], function (err) {
                console.log("++++++++++++++execute error:" + err.message);
            });
            console.log("++++++++++++++execute end===================");
        }
    }

    return {
        execute: function (query, args, successFn) {
            try {
                console.log("++++++++++++++execute start===================");
                document.addEventListener("deviceready", function () {
                    waitCopyDB([query, args, successFn]);
                }, false);
            } catch (e) {
                alert(e.message);
            }
        }
    };
})

.factory('FileHelper', function ($cordovaFile) {
    function createSubDir(rootPath, subDirList, successFn) {
        var dir = subDirList.shift();
        if (dir) {
            $cordovaFile.createDir(rootPath, dir, false)
                        .then(function (success) {
                            rootPath = rootPath + '/' + dir;
                            createSubDir(rootPath, subDirList, successFn);
                        }, function (error) {
                            rootPath = rootPath + '/' + dir;
                            createSubDir(rootPath, subDirList, successFn);
                        });
        } else {
            successFn();
        }
    }

    return {
        createDir: function (rootPath, dirPath, successFn) {
            try {
                if (dirPath.substring(dirPath.length - 1) == '/')
                    dirPath = dirPath.substring(0, dirPath.length - 1);
                var dirList = dirPath.split('/');
                createSubDir(rootPath, dirList, successFn);
            } catch (e) {
                alert(e.message);
            }
        }
    };
})

.factory('Login', function ($rootScope, $state, $ionicHistory, SqliteHelper) {
    return {
        getAllProjets: function (callback) {
            console.log("++++++++++++++getAllProjets start===================");
            //setTimeout(function () {
            //    SqliteHelper.execute("select projectCode,projectName from projects", [], function (res) {
            //        callback(res);
            //    });
            //}, 5000);
            SqliteHelper.execute("select projectCode,projectName from projects order by orderno desc", [], function (res) {
                callback(res);
            });
            console.log("++++++++++++++getAllProjets end===================");
        },
        checkShopName: function (shopCode, callback) {
            SqliteHelper.execute('select shopname from shop where shopcode=?', [shopCode], function (res) {
                callback(res);
            });
        },
        tryLogin: function (shopCode, password, projectCode, callback) {
            SqliteHelper.execute('select shopcode,password from shop where shopcode=?', [shopCode], function (res) {
                callback(res);
            });
        }
    };
})

.factory('Answer', function ($rootScope, $ionicLoading, SqliteHelper) {
    return {
        //===============================================清单列表========================================================================
        getAllVinCode: function (isAllVinCode, callback) {
            $ionicLoading.show({
                template: 'Loading...'
            });
            var query = "";
            if (isAllVinCode){
                query = "select vincode,vincode8,photoname,addchk,remark from answer where projectcode=? and shopcode=? order by vincode8";
            }
            else{
                query = "select vincode,vincode8,photoname,addchk,remark from answer where projectcode=? and shopcode=? and addchk='N' and (photoname is null or photoname='') and (remark is null or remark='') order by vincode8";
            }
            SqliteHelper.execute(query, [$rootScope.projectCode, $rootScope.shopCode], function (res) {
                callback(res);
            });
        },
        saveVINPhotoName: function (vinCode, photoName, callback) {
            SqliteHelper.execute("update answer set photoname=? where projectcode=? and shopcode=? and vincode=?", [photoName, $rootScope.projectCode, $rootScope.shopCode, vinCode], function (res) {
                callback();
            });
        },
        saveVINPhotoNameAndNoteName: function (vinCode, note, photoName, callback) {
            SqliteHelper.execute("update answer set photoname=?,remark=? where projectcode=? and shopcode=? and vincode=?", [photoName, note, $rootScope.projectCode, $rootScope.shopCode, vinCode], function (res) {
                callback();
            });
        },
        saveNote: function (vinCode, remark, callback) {
            SqliteHelper.execute("update answer set remark=? where projectcode=? and shopcode=? and vincode=?", [remark, $rootScope.projectCode, $rootScope.shopCode, vinCode], function (res) {
                callback();
            });
        },
        getAllNoteA: function (callback) {
            SqliteHelper.execute("select notename from Note where ProjectCode=? and Type='A'", [$rootScope.projectCode], function (res) {
                callback(res);
            });
        },
        initData: function (vinCode, callback) {
            SqliteHelper.execute("select remark,photoname from answer where projectcode=? and shopcode=? and vincode=?", [$rootScope.projectCode, $rootScope.shopCode, vinCode], function (res) {
                if (res.rows.length > 0) {
                    callback(res.rows.item(0));
                }
            });
        },
        //===============================================登记========================================================================
        getAllNoteB: function (callback) {
            SqliteHelper.execute("select notename from Note where ProjectCode=? and Type='B'", [$rootScope.projectCode], function (res) {
                callback(res);
            });
        },
        getAllCarType: function (callback) {
            SqliteHelper.execute("select cartypename from cartype order by cartypename", [], function (res) {
                callback(res);
            });
        },
        saveVINCode: function (vinCode, carType, note, vinPhotoName, carPhotoName, vinfpPhotoName, callback) {
            var photoName = vinPhotoName + ';' + carPhotoName + ';' + vinfpPhotoName;
            SqliteHelper.execute("select vincode,vincode8 from answer where projectcode=? and shopcode=? and vincode=?", [$rootScope.projectCode, $rootScope.shopCode, vinCode], function (res) {
                if (res.rows.length > 0) {//update
                    //if (res.rows.item(0).AddChk == 'N') {
                    //    callback('清单列表中已存在');
                    //    return;
                    //}
                    //SqliteHelper.execute("update answer set modelname=?,remark=?,photoname=? where projectcode=? and shopcode=? and vincode=?", [carType, note, photoName, $rootScope.projectCode, $rootScope.shopCode, vinCode], function (res) {
                    //    callback('更新成功');
                    //});
                    callback('VIN号码已存在');
                } else {//Insert
                    SqliteHelper.execute("insert into answer(projectcode,shopcode,vincode,vincode8,modelname,saleflag,photoname,remark,addchk,inuserid,indatetime) values(?,?,?,?,?,?,?,?,?,?,?)",
                                         [$rootScope.projectCode, $rootScope.shopCode, vinCode, vinCode.substring(vinCode.length - 8), carType, 'Y', photoName, note, 'Y', 'mobile_device', 'datetime()'], function (res) {
                                             callback('保存成功');
                                         });
                }
            });
        },
        //===============================================导出========================================================================
        getExportData: function (callback) {
            SqliteHelper.execute("select shopcode,vincode,modelname,submodelname,stockage,saleflag,ifnull(photoname,'') as PhotoName,remark from answer where ProjectCode=? and shopcode=? and addchk='N'", [$rootScope.projectCode, $rootScope.shopCode], function (res1) {
                SqliteHelper.execute("select shopcode,vincode,modelname,photoname,remark from answer where ProjectCode=? and shopcode=? and addchk='Y'", [$rootScope.projectCode, $rootScope.shopCode], function (res2) {
                    callback(res1,res2);
                });
            });
        }
    };
});
