(function () {
        'use strict';

        angular
            .module('eLibraryApp')
            .controller('BookDetailController', BookDetailController);

        BookDetailController.$inject = ['$scope', '$http', '$rootScope', '$stateParams', 'previousState', 'DataUtils', 'entity', 'Principal', 'Book', 'ReadBook', 'Profile', 'Genre'];

        function BookDetailController($scope, $http, $rootScope, $stateParams, previousState, DataUtils, entity, Principal, Book, ReadBook, Profile, Genre) {
            var vm = this;

            vm.book = entity;
            vm.previousState = previousState.name;
            vm.byteSize = DataUtils.byteSize;
            vm.openFile = DataUtils.openFile;
            vm.isRead = false;
            vm.isReading = false;

            pdfjsLib.GlobalWorkerOptions.workerSrc = '/build/pdf.worker.js';

            var unsubscribe = $rootScope.$on('eLibraryApp:bookUpdate', function (event, result) {
                vm.book = result;
            });

            $scope.$on('$destroy', unsubscribe);

            var canvas = document.getElementById('book-canvas');
            var context = canvas.getContext('2d');

            vm.pdfBook = {
                pdfDoc: null,
                pageNum: 1,
                pageRendering: false,
                pageNumPending: null,
                scale: 1
            };

            function renderPage(num) {
                vm.pdfBook.pageRendering = true;
                vm.pdfBook.pdfDoc.getPage(num).then(function (page) {
                    var viewport = page.getViewport(vm.pdfBook.scale);
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    var renderTask = page.render(renderContext);

                    renderTask.promise.then(function () {
                        vm.pdfBook.pageRendering = false;
                        if (vm.pdfBook.pageNumPending !== null) {
                            renderPage(vm.pdfBook.pageNumPending);
                            vm.pdfBook.pageNumPending = null;
                        }
                    });
                    vm.pdfBook.pageNum = num;
                });
            }

            function queueRenderPage(num) {
                if (vm.pdfBook.pageRendering) {
                    vm.pdfBook.pageNumPending = num;
                } else {
                    renderPage(num);
                }
            }

            function markAsRead() {
                if (Principal.isAuthenticated() && !vm.isRead) {
                    $http({
                        method: 'GET',
                        url: '/api/read-books'
                    }).success(function (data) {
                        if (data.find(function (o) {
                            return o.bookId === vm.book.id &&
                                o.profileId === vm.book.profileId;
                        }) == null)
                            ReadBook.save({
                                bookId: vm.book.id,
                                profileId: vm.book.profileId
                            });
                    });
                    vm.isRead = true;
                }
            }

            $scope.firstPage = function () {
                vm.pdfBook.pageNum = 1;
                queueRenderPage(vm.pdfBook.pageNum);
            };

            $scope.lastPage = function () {
                vm.pdfBook.pageNum = vm.pdfBook.pdfDoc.numPages;
                queueRenderPage(vm.pdfBook.pdfDoc.numPages);
                markAsRead();
            };

            $scope.prevPage = function () {
                if (vm.pdfBook.pageNum <= 1) {
                    return;
                }
                vm.pdfBook.pageNum--;
                queueRenderPage(vm.pdfBook.pageNum);
            };

            $scope.nextPage = function () {
                if (vm.pdfBook.pageNum >= vm.pdfBook.pdfDoc.numPages) {
                    return;
                }
                vm.pdfBook.pageNum++;
                if (vm.pdfBook.pageNum === vm.pdfBook.pdfDoc.numPages)
                    markAsRead();
                queueRenderPage(vm.pdfBook.pageNum);
            };

            $scope.read = function () {
                $http({
                    method: 'GET',
                    url: '/api/books/' + vm.book.id + '/download',
                    responseType: 'blob'
                }).success(function (data, status, headers) {
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], {type: contentType});
                    var objectUrl = URL.createObjectURL(file);
                    pdfjsLib.getDocument(objectUrl).then(function (pdfDoc) {
                        vm.isReading = true;
                        vm.pdfBook.pdfDoc = pdfDoc;
                        renderPage(vm.pdfBook.pageNum);
                    });
                });
            };

            $scope.download = function () {
                $http({
                    method: 'GET',
                    url: '/api/books/' + vm.book.id + '/download',
                    responseType: 'blob'
                }).success(function (data, status, headers) {
                    var contentType = headers('Content-Type');
                    var disposition = headers('Content-Disposition');
                    var startPos = disposition.indexOf('\"') + 1;
                    var endPos = disposition.indexOf('\"', startPos);
                    var filename = disposition.substring(startPos, endPos);
                    var file = new Blob([data], {type: contentType});
                    var objectUrl = URL.createObjectURL(file);
                    var a = document.createElement('a');
                    a.href = objectUrl;
                    a.target = '_blank';
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            }
        }
    }

)
();
