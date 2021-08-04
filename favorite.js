const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
let filteredMovies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const displayMode = document.querySelector(".display-mode-container");
const cardMode = document.querySelector("#card-mode");
const listMode = document.querySelector("#list-mode");
const paginator = document.querySelector("#paginator");
const MOVIES_PER_PAGE = 12; //希望一頁有幾個電影卡片
let MODE = "card"; //預設模式為卡片模式
let NOW_PAGE = 1; //存放當前頁面
const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
let deleteFavorite = document.querySelector('.btn-remove-favorite')
const navItem = document.querySelectorAll(".nav-item");
navItem[1].classList.add("active");
const navBar= document.querySelector(".navbar-nav");


// 點擊標籤時賦予 active 的
// function addActiveClass(e){
//   // e.preventDefault();
//   let targetDOM = e.target.parentNode;  
//   if(targetDOM.matches(".nav-item")){
//     for(let i=0;i<navItem.length;i++){
//       navItem[i].classList.remove("active");
//     }
//     e.target.parentNode.classList.add("active");
//   }  
// }

// navBar.addEventListener('click',addActiveClass)

init();

// 最愛頁面渲染 需有判斷模式，並渲染該模式的電影列表
function renderFavoriteList(data) {
  let rawHTML = "";
  if (MODE === "card") {
    cardMode.style.color = "red"; //讓使用者知道當前顯示模式
    listMode.style.color = "";
    //如果MODE為'card'就渲染卡片模式
    data.forEach((item) => {
      //title, image
      rawHTML += `
     <div class="col-sm-3 mb-3">
        <div class="card h-100">
            <img
              src="${POSTER_URL + item.image}"
              
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
         </div>
       </div>
     `;
    });
  } else if (MODE === "list") {
    listMode.style.color = "red"; //讓使用者知道當前顯示模式
    cardMode.style.color = "";
    //如果MODE為'list'就渲染清單模式
    data.forEach((item) => {
      //title, image
      rawHTML += `
     <div class="container pt-3">
        <div class="row movie-list-mode">
          <div class="col-8">
            <h5 class="movie-title">${item.title}</h5>
          </div>
          <div class="col-4">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
          </div>
        </div>
      </div>
     `;
    });
  }
  dataPanel.innerHTML = rawHTML;
}

// 渲染分頁器頁碼
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
  // 當篩選清單沒有內容時 找不到 paginator的子元素便會報錯且最後一筆資料不會從畫面中移除
  if(list.length === 0){
    return
  }
  paginator.children[NOW_PAGE - 1].classList.add("active");
}

//回傳當前的電影陣列
function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : list;
  // page 1 => 1~12 data[0]~data[11]    data.slice(0,12)
  // page 2 => 13~24 data[12]~data[23]  data.slice(12,24)
  // page 3 => 25~36 data[24]~data[35]  data.slice(24,36)
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 渲染 Modal 視窗
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}



// 搜尋欄掛上監聽器，判斷有無符合的搜尋結果並渲染頁面
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消submit預設事件（不要讓網頁重新跑一次）
  event.preventDefault();
  //取得input輸入的關鍵字
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = list.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  NOW_PAGE = 1;
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    searchInput.value = "";
    return alert(`您輸入的關鍵字：${keyword}沒有符合條件的電影：（`);
  }
  console.log(filteredMovies)
  renderPaginator(filteredMovies.length);
  renderFavoriteList(getMovieByPage(NOW_PAGE));
});

// 將電影移出收藏清單
function removeFavorite(id){
  let itemIndex = list.findIndex(item => item.id === id);
  if(itemIndex === -1) return;  
  list.splice(itemIndex,1)
  console.log(list);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  renderPaginator(list.length);
  renderFavoriteList(getMovieByPage(NOW_PAGE));
}

// 在渲染區掛上監聽器，判斷使用者要show Modal或是移出收藏清單
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFavorite(Number(event.target.dataset.id));
  }
});

// 分頁器掛上監聽器，判斷使用者想到第幾頁，並渲染頁面
paginator.addEventListener("click", function onPaginatorClicked(event) {
  const target = event.target;
  const data = filteredMovies.length ? filteredMovies : list;
  if (target.tagName !== "A") return;
  NOW_PAGE = Number(event.target.dataset.page);
  renderPaginator(data.length);
  renderFavoriteList(getMovieByPage(NOW_PAGE));
});

// 在右上角圖示掛上切換模式的監聽器
displayMode.addEventListener("click", function ondisplayModeContainer(event) {
  const target = event.target;
  if (target.matches("#card-mode")) {
    MODE = "card";
    renderFavoriteList(getMovieByPage(NOW_PAGE));
  } else if (target.matches("#list-mode")) {
    MODE = "list";
    renderFavoriteList(getMovieByPage(NOW_PAGE));
  }
});


function init(){
  // console.log(list);
  renderPaginator(list.length);
  renderFavoriteList(getMovieByPage(NOW_PAGE));
}

