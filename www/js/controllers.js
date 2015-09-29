angular.module('starter.controllers', [])
//登陆
.controller('LoginCtrl', function ($scope, $rootScope, $state, $cordovaCamera, $cordovaFile, $cordovaSQLite, $cordovaSplashscreen, $ionicHistory, SqliteHelper, Login, FileHelper) {
    $rootScope.shopCode = '';
    $scope.viewState = { shopCode: '', shopName: '', password: '' };
    $scope.project = {};
    $scope.projects = new Array();
    Login.getAllProjets(function (res) {
        for (var i = 0; i < res.rows.length; i++) {
            $scope.projects.push(res.rows.item(i));
        }
        $scope.project = $scope.projects[0];

        if (typeof (Storage) !== "undefined") {
            $scope.viewState.shopCode = $rootScope.shopCode = parseInt(localStorage.shopCode) || '';
            $scope.checkShopName($scope.viewState.shopCode);
            $scope.viewState.password = localStorage.password || '';
            if (localStorage.projectCode) {
                for (var i = 0; i < $scope.projects.length; i++) {
                    if ($scope.projects[i].ProjectCode == localStorage.projectCode) {
                        $scope.project = $scope.projects[i];
                        break;
                    }
                }
            }
        }

        $cordovaSplashscreen.hide();
    });

    $scope.checkShopName = function (shopCode) {
        Login.checkShopName(shopCode, function (res) {
            if (res.rows.length > 0) {
                $scope.viewState.shopName = res.rows.item(0).ShopName;
            }
            else {
                $scope.viewState.shopName = '';
            }
        });
    };

    $scope.login = function (shopCode, password, projectCode) {
        Login.tryLogin(shopCode, password, projectCode, function (res) {
            if (res.rows.length > 0) {
                if (res.rows.item(0).Password == password) {
                    $rootScope.shopCode = shopCode;
                    $rootScope.projectCode = projectCode;

                    if (typeof (Storage) !== "undefined") {
                        localStorage.shopCode = shopCode;
                        localStorage.password = password;
                        localStorage.projectCode = projectCode;
                    }

                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $state.go('tab.dash', { searchText: '', isAllVinCode: false });
                }
                else {
                    alert("密码错误");
                }
            }
            else {
                alert("该经销商不存在");
            }
        });
    };
})
//经销商库存表
.controller('DashCtrl', function ($scope, $rootScope, $stateParams, $state, $cordovaCamera, $cordovaFile, $ionicLoading, FileHelper, Answer) {
    $scope.viewState = {
        searchText: $stateParams.searchText,
        isAllVinCode: $stateParams.isAllVinCode == 'true' ? true : false
    };
    $scope.vinCodeList = new Array();
    Answer.getAllVinCode($scope.viewState.isAllVinCode, function (res) {
        for (var i = 0; i < res.rows.length; i++) {
            var vinCode = res.rows.item(i);
            if (vinCode.AddChk == 'Y') {
                vinCode.Style = { color: 'blue' };
            } else if ((vinCode.PhotoName && vinCode.PhotoName.length > 0) || (vinCode.Remark && vinCode.Remark.length > 0)) {
                vinCode.Style = { color: 'green' };
            } else {
                vinCode.Style = { color: 'black' };
            }
            $scope.vinCodeList.push(vinCode);
        }
        $ionicLoading.hide();
    });
    $scope.isAllVinCodeChange = function (isAllVinCode) {
        setTimeout(function () {
            Answer.getAllVinCode(isAllVinCode, function (res) {
                $scope.vinCodeList = new Array();
                for (var i = 0; i < res.rows.length; i++) {
                    var vinCode = res.rows.item(i);
                    if (vinCode.AddChk == 'Y') {
                        vinCode.Style = { color: 'blue' };
                    } else if ((vinCode.PhotoName && vinCode.PhotoName.length > 0) || (vinCode.Remark && vinCode.Remark.length > 0)) {
                        vinCode.Style = { color: 'green' };
                    } else {
                        vinCode.Style = { color: 'black' };
                    }
                    $scope.vinCodeList.push(vinCode);
                }
                $ionicLoading.hide();
            });
        }, 10);
    };
    $scope.itemClick = function (item, clickEvent) {
        if (item.AddChk == 'N') {
            var vinCode = item.VinCode;
            //if (clickEvent.target.localName != 'input') {
            //    $ionicLoading.show({
            //        template: 'Loading...'
            //    });
            //    setTimeout(function () {
            //        $state.go('tab.dash-detail', { vinCode: vinCode, searchText: $scope.viewState.searchText, isAllVinCode: $scope.viewState.isAllVinCode }, { reload: true });
            //    }, 1000);
            //}
            $ionicLoading.show({
                template: 'Loading...'
            });
            setTimeout(function () {
                $state.go('tab.dash-detail', { vinCode: vinCode, searchText: $scope.viewState.searchText, isAllVinCode: $scope.viewState.isAllVinCode }, { reload: true });
            }, 1000);
        }
    }
    $scope.btnClick = function (vinCode) {
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,//Camera.DestinationType.DATA_URL,FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
        $cordovaCamera.getPicture(options).then(onSuccess_for_file, function (err) { });
        function onSuccess_for_file(imageURI) {
            url = imageURI.split("/");
            fileName = url[url.length - 1];
            FileHelper.createDir(cordova.file.externalRootDirectory, "英菲尼迪库存盘点/" + $rootScope.shopCode + "/经销商库存表/", function () {
                $cordovaFile.moveFile(cordova.file.externalApplicationStorageDirectory + "cache/", fileName, cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/经销商库存表", vinCode + '.jpg')
                            .then(function (success) {
                                Answer.saveVINPhotoName(vinCode, vinCode + '.jpg', function () {
                                    Answer.getAllVinCode($scope.viewState.isAllVinCode, function (res) {
                                        $scope.vinCodeList = new Array();
                                        for (var i = 0; i < res.rows.length; i++) {
                                            var vinCode = res.rows.item(i);
                                            if (vinCode.PhotoName && vinCode.PhotoName.length > 0) {
                                                vinCode.Style = { color: 'green' };
                                            }
                                            else {
                                                vinCode.Style = { color: 'black' };
                                            }
                                            $scope.vinCodeList.push(vinCode);
                                        }
                                        $ionicLoading.hide();
                                    });
                                });
                            }, function (error) {
                                alert(error);
                            });
            });
        }
    }
})
//经销商库存表详细
.controller('DashDetailCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaCamera, $cordovaFile, $ionicLoading, $ionicHistory, FileHelper, Answer) {
    $scope.noteList = new Array();
    $scope.viewState = {
        vinCode: $stateParams.vinCode,
        note: {},
        customNoteName: '',
        vin_img_uri: 'img/ionic.png',
        vinfp_img_uri: 'img/ionic.png',
        vinPhotoUri: '',
        vinfpPhotoUri: '',
        searchText: $stateParams.searchText,
        isAllVinCode: $stateParams.isAllVinCode == 'true' ? true : false,
        isUpdate: false
    };

    Answer.getAllNoteA(function (res) {
        $scope.noteList.push({ NoteName: "无" });
        for (var i = 0; i < res.rows.length; i++) {
            $scope.noteList.push(res.rows.item(i));
        }
        //$scope.noteList.push({ NoteName: "其他（手工填写）" });
        $scope.viewState.note = $scope.noteList[0];
    });
    Answer.initData($scope.viewState.vinCode, function (model) {
        if (model.PhotoName == '') {
            $scope.viewState.vin_img_uri = 'img/ionic.png';
            $scope.viewState.vinfp_img_uri = 'img/ionic.png';
            $scope.viewState.isUpdate = false;
        } else if (model.PhotoName.indexOf("_销售发票") >= 0) {
            $scope.viewState.vin_img_uri = 'img/ionic.png';
            $scope.viewState.vinfp_img_uri = cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/经销商库存表/" + model.PhotoName + "?lastmod=" + (new Date()).toString();
            $scope.viewState.isUpdate = true;
        } else {
            $scope.viewState.vin_img_uri = cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/经销商库存表/" + model.PhotoName + "?lastmod=" + (new Date()).toString();
            $scope.viewState.vinfp_img_uri = 'img/ionic.png';
            $scope.viewState.isUpdate = true;
        }
        if (model.Remark && model.Remark.length > 0) {
            var matched = false;
            for (var i = 0; i < $scope.noteList.length; i++) {
                if ($scope.noteList[i].NoteName == model.Remark) {
                    $scope.viewState.note = $scope.noteList[i];
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                $scope.viewState.note = $scope.noteList[$scope.noteList.length - 1];
                $scope.viewState.customNoteName = model.Remark;
            }
        }
        $ionicLoading.hide();
    });

    $scope.vinPicture = function () {
        $ionicLoading.show({
            template: 'Loading...'
        });
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,//Camera.DestinationType.DATA_URL,FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.viewState.vinPhotoUri = imageURI;
            $scope.viewState.vin_img_uri = imageURI;
            $scope.viewState.vinfpPhotoUri = "";
            $scope.viewState.vinfp_img_uri = 'img/ionic.png' + "?lastmod=" + (new Date()).toString();
            $scope.viewState.isUpdate = false;
            $ionicLoading.hide();
        }, function (err) { $ionicLoading.hide() });
    };
    $scope.vinfpPicture = function () {
        $ionicLoading.show({
            template: 'Loading...'
        });
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,//Camera.DestinationType.DATA_URL,FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.viewState.vinfpPhotoUri = imageURI;
            $scope.viewState.vinfp_img_uri = imageURI;
            $scope.viewState.vinPhotoUri = "";
            $scope.viewState.vin_img_uri = 'img/ionic.png' + "?lastmod=" + (new Date()).toString();
            $scope.viewState.isUpdate = false;
            $scope.viewState.note.NoteName = '其他（手工填写）';
            $scope.viewState.customNoteName = '车辆售出已开发票';
            $ionicLoading.hide();
        }, function (err) { $ionicLoading.hide() });
    };
    $scope.btnSaveClick = function () {
        var vinCode = $scope.viewState.vinCode;
        var vinPhotoUri = $scope.viewState.vinPhotoUri;
        var vinfpPhotoUri = $scope.viewState.vinfpPhotoUri;

        var note = "";
        if ($scope.viewState.note.NoteName == '其他（手工填写）') {
            note = $scope.viewState.customNoteName;
        } else if ($scope.viewState.note.NoteName == '无') {
            note = '';
        } else {
            note = $scope.viewState.note.NoteName;
        }

        if (vinPhotoUri == "" && vinfpPhotoUri == "") {
            Answer.saveVINPhotoNameAndNoteName(vinCode, note, '', function () {
                alert('保存成功');
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('tab.dash', { searchText: $scope.viewState.searchText, isAllVinCode: $scope.viewState.isAllVinCode, timeStamp: (new Date()).toString() }, { reload: true });
            });
        } else {
            var photoName = "";
            if (vinPhotoUri != "") {
                photoName = vinCode + '.jpg';
            }
            else {
                photoName = vinCode + '_销售发票' + '.jpg';
            }
            Answer.saveVINPhotoNameAndNoteName(vinCode, note, photoName, function () {
                url = vinPhotoUri != "" ? vinPhotoUri.split("/") : vinfpPhotoUri.split("/");
                fileName = url[url.length - 1];
                FileHelper.createDir(cordova.file.externalRootDirectory, "英菲尼迪库存盘点/" + $rootScope.shopCode + "/经销商库存表/", function () {
                    if ($scope.viewState.isUpdate) {
                        alert('保存成功');
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                        $state.go('tab.dash', { searchText: $scope.viewState.searchText, isAllVinCode: $scope.viewState.isAllVinCode, timeStamp: (new Date()).toString() }, { reload: true });
                    } else {
                        $cordovaFile.moveFile(cordova.file.externalApplicationStorageDirectory + "cache/", fileName, cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/经销商库存表", photoName)
                                    .then(function (success) {
                                        alert('保存成功');
                                        $ionicHistory.nextViewOptions({
                                            disableBack: true
                                        });
                                        $state.go('tab.dash', { searchText: $scope.viewState.searchText, isAllVinCode: $scope.viewState.isAllVinCode, timeStamp: (new Date()).toString() }, { reload: true });
                                    });
                    }
                }, function (error) {
                    alert(error);
                });
            });
        }
    };
})
//在库不在系统
.controller('ChatsCtrl', function ($scope, $rootScope, $cordovaCamera, $cordovaFile, $state, $ionicLoading, $stateParams, $ionicHistory, FileHelper, Answer) {
    $scope.viewState = {
        vinCode: '',
        carType: {},
        note: {},
        customNoteName: '',
        vin_img_uri: 'img/ionic.png',
        car_img_uri: 'img/ionic.png',
        vinfp_img_uri: 'img/ionic.png',
        vinPhotoUri: '',
        carPhotoUri: '',
        vinfpPhotoUri: ''
    };
    $scope.carTypeList = new Array();
    $scope.noteList = new Array();

    Answer.getAllCarType(function (res) {
        $scope.carTypeList.push({ CarTypeName: "选择" });
        for (var i = 0; i < res.rows.length; i++) {
            $scope.carTypeList.push(res.rows.item(i));
        }
        $scope.viewState.carType = $scope.carTypeList[0];
    });
    Answer.getAllNoteB(function (res) {
        $scope.noteList.push({ NoteName: "无" });
        for (var i = 0; i < res.rows.length; i++) {
            $scope.noteList.push(res.rows.item(i));
        }
        //$scope.noteList.push({ NoteName: "其他（手工填写）" });
        $scope.viewState.note = $scope.noteList[0];
    });

    $scope.vinPicture = function () {
        $ionicLoading.show({
            template: 'Loading...'
        });
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,//Camera.DestinationType.DATA_URL,FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.viewState.vinPhotoUri = imageURI;
            $scope.viewState.vin_img_uri = imageURI;
            $ionicLoading.hide();
        }, function (err) { $ionicLoading.hide() });
    };
    $scope.carPicture = function () {
        $ionicLoading.show({
            template: 'Loading...'
        });
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,//Camera.DestinationType.DATA_URL,FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.viewState.carPhotoUri = imageURI;
            $scope.viewState.car_img_uri = imageURI;
            $ionicLoading.hide();
        }, function (err) { $ionicLoading.hide() });
    };
    $scope.vinfpPicture = function () {
        $ionicLoading.show({
            template: 'Loading...'
        });
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,//Camera.DestinationType.DATA_URL,FILE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG
        };
        $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.viewState.vinfpPhotoUri = imageURI;
            $scope.viewState.vinfp_img_uri = imageURI;
            $ionicLoading.hide();
        }, function (err) { $ionicLoading.hide() });
    };
    $scope.btnSaveClick = function () {
        var vinCode = $scope.viewState.vinCode;
        var carType = $scope.viewState.carType.CarTypeName;
        var note = '';
        var vinPhotoUri = $scope.viewState.vinPhotoUri;
        var carPhotoUri = $scope.viewState.carPhotoUri;
        var vinfpPhotoUri = $scope.viewState.vinfpPhotoUri;
        if ($scope.viewState.note.NoteName == '其他（手工填写）') {
            note = $scope.viewState.customNoteName;
        } else if ($scope.viewState.note.NoteName == '无') {
            note = '';
        } else {
            note = $scope.viewState.note.NoteName;
        }

        if (vinCode.length != 17) {
            alert('VIN号码格式不正确'); return;
        }
        if (carType == "选择") {
            alert('请选择车型'); return;
        }
        if ($scope.viewState.note.NoteName != '无' && note == '') {
            alert('请手工填写备注'); return;
        }
        if (vinPhotoUri == '') {
            alert('请对VIN号码拍照'); return;
        }
        if (carPhotoUri == '') {
            alert('请对车尾拍照'); return;
        }

        var vinPhotoName = vinCode + '.jpg';
        var carPhotoName = vinCode + '_' + carType + '.jpg';
        var vinfpPhotoName = vinfpPhotoUri == '' ? '' : vinCode + '_销售发票' + '.jpg';
        Answer.saveVINCode(vinCode, carType, note, vinPhotoName, carPhotoName, vinfpPhotoName, function (msg) {
            if (msg == '保存成功') {
                FileHelper.createDir(cordova.file.externalRootDirectory, "英菲尼迪库存盘点/" + $rootScope.shopCode + "/在库未在系统统计表/", function () {
                    //copy vinPhoto to sdcard
                    var url = vinPhotoUri.split("/");
                    var fileName = url[url.length - 1];
                    $cordovaFile.moveFile(cordova.file.externalApplicationStorageDirectory + "cache/", fileName, cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/在库未在系统统计表", vinPhotoName)
                                .then(function (success) {
                                    //copy carPhoto to sdcard
                                    url = carPhotoUri.split("/");
                                    fileName = url[url.length - 1];
                                    $cordovaFile.moveFile(cordova.file.externalApplicationStorageDirectory + "cache/", fileName, cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/在库未在系统统计表", carPhotoName)
                                                .then(function (success) {
                                                    if (vinfpPhotoUri != '') {
                                                        //copy vinfpPhoto to sdcard
                                                        url = vinfpPhotoUri.split("/");
                                                        fileName = url[url.length - 1];
                                                        $cordovaFile.moveFile(cordova.file.externalApplicationStorageDirectory + "cache/", fileName, cordova.file.externalRootDirectory + "英菲尼迪库存盘点/" + $rootScope.shopCode + "/在库未在系统统计表", vinfpPhotoName)
                                                                    .then(function (success) {
                                                                        alert(msg);
                                                                        $ionicHistory.nextViewOptions({
                                                                            disableAnimate: true,
                                                                            disableBack: true
                                                                        });
                                                                        $state.go('tab.chats', { timeStamp: (new Date()).toString() }, { reload: true });
                                                                    }, function (error) {
                                                                        alert(error);
                                                                    });
                                                    } else {
                                                        alert(msg);
                                                        $ionicHistory.nextViewOptions({
                                                            disableAnimate: true,
                                                            disableBack: true
                                                        });
                                                        $state.go('tab.chats', { timeStamp: (new Date()).toString() }, { reload: true });
                                                    }
                                                }, function (error) {
                                                    alert(error);
                                                });
                                }, function (error) {
                                    alert(error);
                                });
                });
            } else {
                alert(msg);
            }
        });
    };
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})
//结果导出
.controller('AccountCtrl', function ($scope, Answer) {
    $scope.export = function () {
        try {
            Answer.getExportData(function (res1, res2) {
                var answerList1 = new Array();
                for (var i = 0; i < res1.rows.length; i++) {
                    if (res1.rows.item(i).PhotoName.indexOf("_销售发票") >= 0) {
                        res1.rows.item(i).PhotoName = "";
                    }
                    answerList1.push(res1.rows.item(i));
                }
                var answerList2 = new Array();
                for (var i = 0; i < res2.rows.length; i++) {
                    answerList2.push(res2.rows.item(i));
                }

                window.echo([answerList1, answerList2], function (echoValue) {
                    alert('导出成功\n' + '文件名：\n' + echoValue); // should alert true.
                });
            });
        } catch (e) {
            alert(e.message);
        }
    }
});