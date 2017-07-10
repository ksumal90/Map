var template = `
<div class="oneComment">
    <span class="name">{{name}}</span><span class="time">{{time}}</span>
    <div>{{place}}</div>
    <div class="com">{{comment}}</div>
</div>
`;

var myMap;
var clusterer;
var balloon;
var myPlacemark;
var allObject = {};

new Promise(resolve => window.onload = resolve)
    .then(response => new Promise(resolve => ymaps.ready(resolve)))
    .then(function(response){
         myMap = new ymaps.Map('map', {
            center: [59.92825625526198, 30.32086025254883],
            zoom: 12
        }, {
            searchControlProvider: 'yandex#search'
        });
            customItemContentLayout = ymaps.templateLayoutFactory.createClass(
               '<div class=slidePlace>{{properties.place|raw}}</div>' +
                '<div id=slideAdress>{{properties.adress|raw}}</div>' +
                '<div class=slideComment>{{properties.comment|raw}}</div>'+
                '<div class=slideTime>{{properties.time|raw}}</div>'
				);
        var clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            // Устанавливаем стандартный макет балуна кластера "Карусель".
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            // Устанавливаем собственный макет.
            clusterBalloonItemContentLayout: customItemContentLayout,
            // Устанавливаем режим открытия балуна. 
            // В данном примере балун никогда не будет открываться в режиме панели.
            clusterBalloonPanelMaxMapArea: 0,
            // Устанавливаем размеры макета контента балуна (в пикселях).
            clusterBalloonContentLayoutWidth: 200,
            clusterBalloonContentLayoutHeight: 130,
            // Устанавливаем максимальное количество элементов в нижней панели на одной странице
            clusterBalloonPagerSize: 5
            // Настройка внешего вида нижней панели.
            // Режим marker рекомендуется использовать с небольшим количеством элементов.
            // clusterBalloonPagerType: 'marker',
            // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
            // clusterBalloonCycling: false,
            // Можно отключить отображение меню навигации.
            // clusterBalloonPagerVisible: false
        });
        MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="balloon">' +
                '<div id="balloonHeader"></div>' +
                '<a class="close" href="#">&times;</a>' +
                '<div class="arrow"></div>' +
                '<div class="popover-inner">' +
                '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
                '</div>' +
                '<div class="allComments">'+
                '<div class="noComment">Пока нет отзывов</div>'+
                '</div>'+
                '<h3 class="h3">Ваш отзыв</h3>'+
                '<form class="form">' +
                    '<label>' +
                        '<input type="text" id="name" placeholder="Ваше имя">' +
                    '</label>' +
                    '<label>' +
                        '<input type="text" id="place" placeholder="Укажите место">' +
                    '</label>' +
                    '<label>' +
                        '<textarea type="text" id="comment" placeholder="Поделитесь впечатлениями"></textarea>' +
                    '</label>' +
                    '<button id="save" class="save">Добавить</button>' +
                '</form>' +
            '</div>', {
                /**Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.*/
                build: function () {
                    this.constructor.superclass.build.call(this);
                    this._$element = $('.balloon', this.getParentElement());
               //    this.applyElementOffset();
                    this._$element.find('.close')
                        .on('click', $.proxy(this.onCloseClick, this));
                },

                /**Удаляет содержимое макета из DOM.*/
                clear: function () {
                    this._$element.find('.close')
                        .off('click');

                    this.constructor.superclass.clear.call(this);
                },

                /**Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.*/
                onSublayoutSizeChange: function () {
                    MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                    if(!this._isElement(this._$element)) {
                        return;
                    }

                   // this.applyElementOffset();

                    this.events.fire('shapechange');
                },

                /**Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.*/
                applyElementOffset: function () {
                    this._$element.css({
                        left: -(this._$element[0].offsetWidth / 2),
                        top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                    });
                },

                /**Закрывает балун при клике на крестик, кидая событие "userclose" на макете. */
                onCloseClick: function (e) {
                    e.preventDefault();

                    this.events.fire('userclose');
                      
                },

                /**Используется для автопозиционирования (balloonAutoPan).*/
                getShape: function () {
                    if(!this._isElement(this._$element)) {
                        return MyBalloonLayout.superclass.getShape.call(this);
                    }

                    var position = this._$element.position();

                    return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                        [position.left, position.top], [
                            position.left + this._$element[0].offsetWidth,
                            position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                        ]
                    ]));
                },

                /**Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).*/
                _isElement: function (element) {
                    return element && element[0] && element.find('.arrow')[0];
                }
            });
            
        //получаем из координат адрес
        function getAddress(coords) {
            ymaps.geocode([coords[0], coords[1]])
            .then(function(resolve){
                balloonHeader.innerHTML = resolve.geoObjects.get(0).properties.get('text');
            });
        };

        function getTime(){
            var now = new Date();
            var year = now.getFullYear();
            var data = now.getDate();
            var month = now.getMonth();
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var seconds = now.getSeconds();
            if(data<10){
               data='0'+data; 
            }
            if(month<10){
               month='0'+month; 
            }
            if(hours<10){
               hours='0'+hours; 
            }
            if(minutes<10){
               hours='0'+hours; 
            }
            if(seconds<10){
               seconds='0'+seconds; 
            }
            return(`${data}.${month}.${year} ${hours}:${minutes}:${seconds}`);
        }

        function getBalloon() {
            var balloon = new ymaps.Balloon(myMap);
            balloon.options.setParent(myMap.options);
            balloon.options.set('layout', MyBalloonLayout);
            return balloon;
        };

        function createPlacemark(coords, obj) {
            return new ymaps.Placemark(coords, obj, {
            },{
                preset: 'islands#violetDotIconWithCaption',
                draggable: true
            });
        }

        function createMark(coords, obj){
            myPlacemark = createPlacemark(coords, obj);
            clusterer.add(myPlacemark);
            myMap.geoObjects.add(clusterer);
        }

        function getContentsForm(coords){
            var inputName = document.querySelector('#name');
            var inputPlace = document.querySelector('#place');
            var inputComment = document.querySelector('#comment');
            if(inputName.value && inputPlace.value && inputComment.value){
                var obj={
                    name:inputName.value,
                    place:inputPlace.value,
                    comment:inputComment.value,
                    time:getTime(),
                    adress:balloonHeader.innerHTML,
                    coords:coords,
                    block:'balloon'
                }
                document.querySelector('.noComment').innerHTML = '';
                var templateFn = Handlebars.compile(template);
                var html = templateFn(obj);
                var container = document.createElement('div');
                container.innerHTML = html;
                document.querySelector('.allComments').appendChild(container);
                if(allObject[obj.adress]){
                    allObject[obj.adress].push(obj);
                }else{
                    allObject[obj.adress]=[];
                    allObject[obj.adress].push(obj);
                }
                createMark(coords, obj);                
            }
            else{
                alert('заполните все поля');
            }
        }

        //открыть балун по координатам
        function openBalloon(coords) {
            if(balloon) {
                balloon.close();
            } 
            balloon = getBalloon();
            balloon.open(coords).then(function(){
                getAddress(coords);
                save.addEventListener('click', function (e) {
                    e.preventDefault();
                    getContentsForm(coords);
                    localStorage.map = JSON.stringify(allObject)
                });
                for (key in allObject) {
                    var array=allObject[key];
                    for (key in array) {
                        if(array[key].coords === coords){
                            document.querySelector('.noComment').innerHTML = '';
                            for (key in array) {
                                var templateFn = Handlebars.compile(template);
                                var html = templateFn(array[key]);
                                var container = document.createElement('div');
                                container.innerHTML = html;
                                document.querySelector('.allComments').appendChild(container);
                            }
                        }
                }
            }
            });
        };
        //проверяем есть ли данные в localStorage
        if(localStorage.map){
            allObject = JSON.parse(localStorage.map);
            for (key in allObject) {
               var temp = allObject[key] 
               for (key in temp) {
                    createMark(temp[key].coords, temp[key]);
                }
            }
         }
        //клик по карте, открываем пустой балун
        myMap.events.add('click', function(e){
            e.preventDefault();
            var coords = e.get('coords');//получаем координаты клика
            openBalloon(coords)//открыть балун по координатам
        })
        //клик по метке
        myMap.geoObjects.events.add('click', function(e){
           if(e.get('target').properties._data.block == "balloon"){
                openBalloon(e.get('target').properties.get('coords'));
           }
        });
        //клик по адресу в слайде
        document.addEventListener('click',function(e){
           	if(e.target.id =='slideAdress'){
    			var slideAdress = e.target.innerHTML;
                coords = allObject[slideAdress]['0'].coords;
                openBalloon(coords);
            }
        })
    })
     .catch(e => alert('Ошибка: ' + e.message));


      