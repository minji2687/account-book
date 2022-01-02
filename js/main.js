var swiper = new Swiper(".mySwiper", {});
import { addDotToAmount, randomRGB } from "./common.js";

let accountData;
function fetchDate() {
  return fetch("https://minji2687.github.io/data/bank.json")
    .then((res) => res.json())
    .then((obj) => {
      return obj.accounts;
    });
}

function init() {
  fetchDate().then((res) => {
    accountData = res;
    showAccountData(res);
    showSavelistData(res);
    showBankList(res);
    showExpenseManagePage(res);
    printChart();
    setEventListener();
    writeAccountStatus();
  });
}

init(); // DOM

function convertDateForm(dateString) {
  let dateStringYear = dateString.split("-")[0];
  let dateStringMonth = dateString.split("-")[1];
  let dateStringDate = dateString.split("-")[2];

  dateStringMonth =
    dateStringMonth[0] === "0"
      ? parseInt(dateStringMonth[1])
      : parseInt(dateStringMonth);

  let nowYear = new Date(Date.now()).getFullYear();
  let nowMonth = new Date(Date.now()).getMonth() + 1;
  let nowDate = new Date(Date.now()).getDate();

  const now = `${nowYear}-${nowMonth}-${nowDate}`;
  let dateStringData = `${dateStringYear}-${dateStringMonth}-${dateStringDate}`;

  if (now === dateStringData) {
    return "오늘";
  } else if (nowYear === dateStringYear && nowMonth - dateStringMonth === 1) {
    return "어제";
  } else if (nowYear === dateStringYear && nowMonth - dateStringMonth === 2) {
    return "이틀전";
  } else {
    return dateStringData;
  }
}

function showAccountData(accounts) {
  const mainAccountListWrap = document.querySelector(".main-account-list-wrap");
  const accountDOMArr = accounts.map((account, index) => {
    return makeAccountListItem(account, index);
  });
  mainAccountListWrap.insertAdjacentHTML("beforeend", accountDOMArr.join(""));
}

function makeAccountListItem(accountData, index) {
  const { accountMoney, accountName, accountNumber, avatarUrl } = accountData;
  return `
      <section class="account-container swiper-slide account${index + 1}">
      <!--상단에 프로필사진, 생활비, 아이콘 2개-->
      <header class="account-header">
          <div class="avatar">
              <img src=${avatarUrl} alt="프로필 이미지">
          </div>
          <h1 class="account-name">${accountName}</h1>
          <div>
              <a><img src="./images/scan.png" alt="스캔 아이콘"></a>
              <a><img src="./images/search.png" alt="찾기 아이콘"></a>
          </div>
      </header>
  
      <!-- 계좌번호 공간 -->
      <section class="account-status">
          <h2 class="section-title__hide"></h2>
          <strong class="account-number">${accountNumber}</strong>
          <span class="transfer-btn"><a href="#">이체</a></span>
          <div class="bank-account"><strong>${addDotToAmount(
            accountMoney
          )}</strong>원</div>
          <div class="account-progress-container">
              <div class="progress">
                  <div class="progressing"></div>
                  <span class="vertical-bar"></span>
              </div>
              <a href="#" class="link-graph"><img src="./images/graph-icon.png" alt="graph-icon"></a>
          </div>
          <p class="account-status__text"><span class="remaining-day">5</span>일 동안 <span class="remaining-money">210,000</span>원 남음</p>
      </section>
  
      <!--광고 베너 부분-->
      <aside class="ad-banner">
          <p class="ad-text">지금 낮은 이자로 생활대출을 신청하세요!<a href="javescript:void(0)">Go</a></p>
      </aside>
  
      <!-- 계좌 상세 공간 -->
      <section class="account-detail">
          <button class="list-scroll-btn"></button>
  
          <h2 class="section-title__hide"></h2>
          <!-- 저금통 내역 -->
          <div class="saving-container">
              <div class="saving-container-inner">
                  <div class="saving-list">
  
  
                  <!--저금통 리스트 들어갈곳-->
  
                  </div>
                  <div class="add-saving-container">
                      <button class="add-saving-btn"><img src="images/saving_plus.png"
                              alt="저금통 추가" /></button>
                      <span>저금통 만들기</span>
                  </div>
  
              </div>
          </div>
          <div class="transaction-container">
              <div class="transaction-days-list">
  
  
              </div>
          </div>
      </section>
  </section>
      `;
}

function showSavelistData(accounts) {
  const savingLists = document.querySelectorAll(".saving-list");

  savingLists.forEach((savingList, index) => {
    const currentAccount = accounts[index];
    savingList.insertAdjacentHTML(
      "beforeend",
      makeSaveList(currentAccount).join("")
    );
    savingList
      .querySelectorAll(".progressing")
      .forEach((progressing, index) => {
        progressing.style.backgroundColor = `${randomRGB()}`;
        progressing.style.width = `${
          (currentAccount.saveList[index].savedMoney /
            currentAccount.saveList[index].targetAmount) *
          100
        }%`;
      });
  });
}

function makeSaveList(account) {
  return account.saveList.map((saveListItem) => {
    return showSaveListItem(saveListItem);
  });
}

function showSaveListItem(saveListItem) {
  const { savingName, savedMoney } = saveListItem;
  return `
    <div class="saving">
        <div class="progressing">
        </div>
        <div class="saving-info">
            <span class="saving-name">${savingName}</span>
            <span class="saved-money">${addDotToAmount(savedMoney)}원</span>
        </div>
    </div>
  `;
}

function showBankList(accountData) {
  const transactionDaysLists = document.querySelectorAll(
    ".transaction-days-list"
  );

  transactionDaysLists.forEach((transactionDaysListEl, index) => {
    makeTransactionDaysList(
      accountData[index].transactionList,
      transactionDaysListEl
    );
  });
}

function makeTransactionDaysList(transactionData, transactionDaysListEl) {
  const bindDataByDateArr = bindDataByDate(transactionData);
  makeTransactionDaysListItem(bindDataByDateArr, transactionDaysListEl);
}

function bindDataByDate(bankData) {
  let newBankData = [];
  for (let i = 0; i < bankData.length; i++) {
    if (bankData[i - 1] && bankData[i - 1].date === bankData[i].date) {
      newBankData[newBankData.length - 1].push(bankData[i]);
    } else {
      let newArr = [];
      newArr.push(bankData[i]);
      newBankData.push(newArr);
    }
  }
  return newBankData;
}

function makeTransactionDaysListItem(bankData, transactionDaysListEl) {
  for (let i = 0; i < bankData.length; i++) {
    const transactionForADay = document.createElement("div");
    transactionForADay.className = "transaction-for-a-day";

    const transactionList = document.createElement("div");
    transactionList.className = "transaction__list";

    let totalExpenses = 0;

    for (let j = 0; j < bankData[i].length; j++) {
      if (bankData[i][j].income === "in") {
        transactionList.insertAdjacentHTML(
          "beforeend",
          `
                      <li class="transaction__item">
                      <span class="transaction__content">${
                        bankData[i][j].history
                      }</span>
                      <span class="transaction__amount income-mark">+${addDotToAmount(
                        bankData[i][j].price
                      )}</span>
                      </li>
                      `
        );
      } else {
        totalExpenses += bankData[i][j].price;
        transactionList.insertAdjacentHTML(
          "beforeend",
          `
                          <li class="transaction__item">
                                  <span class="transaction__content">${
                                    bankData[i][j].history
                                  }</span>
                                  <span class="transaction__amount">${addDotToAmount(
                                    bankData[i][j].price
                                  )}</span>
                          </li>
                          `
        );
      }

      if (j == bankData[i].length - 1) {
        transactionForADay.insertAdjacentHTML(
          "afterbegin",
          `
                          <div class="transaction-status">
                              <h3 class="transaction-date">${convertDateForm(
                                bankData[i][j].date
                              )}</h3>
                              <span class="transaction-total">${addDotToAmount(
                                totalExpenses
                              )}원 지출</span>
                          </div>
                        `
        );
      }
      //TODO: 금액에 "," 표시하기
    }
    transactionForADay.appendChild(transactionList);
    transactionDaysListEl.appendChild(transactionForADay);
  }
}

// 지출리스트를 펼져쳐보기 위한 이벤트 바인딩
function setEventListener() {
  const listScrollBtns = document.querySelectorAll(".list-scroll-btn");
  const accountDetails = document.querySelectorAll(".account-detail"); //top값 변경
  const transactionContainer = document.querySelector(".transaction-container"); //height값 변경
  // const linkGraphBtn = document.querySelector(".link-graph");
  const expenseManagementContainer = document.querySelector(
    ".expense-management-container"
  );
  const expenseManagementPage = expenseManagementContainer.querySelectorAll(
    ".expense-management"
  );
  const linkGraphBtns = document.querySelectorAll(".link-graph");
  const closeBtns = document.querySelectorAll(".expense-management__close-btn");
  const expenseManagementProgressContainer = document.querySelectorAll(
    ".expense-management-container .account-progress-container"
  );

  linkGraphBtns.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      expenseManagementPage[index].classList.remove("hidden");
      setTimeout(() => {
        expenseManagementPage[index].style.top = `${0}vh`;
      }, 0);
    });
  });
  closeBtns.forEach((closeBtn, index) => {
    closeBtn.addEventListener("click", () => {
      expenseManagementPage[index].style.top = `${100}vh`;
      setTimeout(() => {
        expenseManagementPage[index].classList.add("hidden");
      }, 1000);
    });
  });

  //TODO:다른페이지에서도 작동하도록 스크롤 버튼들로 수정해야함

  listScrollBtns.forEach((listScrollBtn, index) => {
    // console.log(listScrollBtn);
    listScrollBtn.addEventListener("touchmove", (e) => {
      accountDetails[index].style.top = `${e.touches[0].clientY}px`;
      accountDetails[index].style.opacity = 0.7;
    });

    listScrollBtn.addEventListener("touchend", (e) => {
      accountDetails[index].style.opacity = 1;

      if (e.changedTouches[0].clientY < 50) {
        accountDetails[index].style.top = "56px";
      } else if (e.changedTouches[0].clientY > 308) {
        accountDetails[index].style.top = "308px";
      }
    });
  });

  expenseManagementProgressContainer.forEach((progressContainer, index) => {
    let lastPercent =
      (accountData[index].spentMoneyForMonth / accountData[index].baseAmount) *
      100;
    let progressbar = progressContainer.querySelector(".progressing");
    let verticalbar = progressContainer.querySelector(".vertical-bar");
    progressbar.style.width = `${lastPercent}%`;
    verticalbar.style.left = `${lastPercent}%`;
  });
}

function showExpenseManagePage(accounts) {
  const expenseManageContainer = document.querySelector(
    ".expense-management-container"
  );

  let expenseManagePageArr = accounts.map((account) => {
    return makeExpenseManagePage(account);
  });
  expenseManageContainer.insertAdjacentHTML(
    "beforeend",
    expenseManagePageArr.join("")
  );
}

function makeExpenseManagePage(account) {
  const { baseAmount, spentMoneyForMonth } = account;
  return `
  <section class="expense-management hidden">
    <button class="expense-management__close-btn">닫기</button>
    <header>
        <h1>지출 관리</h1>
    </header>
    <div class="standard-amount-set">
        <div class="standard-amount-set__info">
            <h2>기준금액설정</h2>
            <div>${baseAmount}원</div>
        </div>
        <div class="account-progress-container">
            <div class="progress">
                <div class="progressing"></div>
                <span class="vertical-bar"></span>
            </div>
        </div>
    </div>

    <div class="expense-management__daily-report">
        <h2>일간 리포트</h2>
        <div class="daily-report__chart">
        <canvas id="myChart" width="400" height="240"></canvas>
        </div>
    </div>

    <div class="expense-management__monthly-report">
        <h2>6월 지출 패턴</h2>
        <div class="monthly-report__graph">


            <span>1,736,500</span>
            <span>원</span>
        </div>
        <ul class="monthly-report__list">
  
        </ul>
    </div>
</section>

`;
}

function writeAccountStatus() {
  let nowYear = new Date(Date.now()).getFullYear();
  let nowMonth = new Date(Date.now()).getMonth() + 1;
  let nowDate = new Date(Date.now()).getDate();

  let lastDate = new Date(nowYear, nowMonth, 0).getDate();
  let remainingDay = lastDate - nowDate;

  let accountStatuses = document.querySelectorAll(".account-status");

  accountStatuses.forEach((accountStatusDom, index) => {
    let progressbar = accountStatusDom.querySelector(
      ".account-status .progressing"
    );
    let verticalbar = accountStatusDom.querySelector(
      ".account-status .vertical-bar"
    );
    let accountStatusText = accountStatusDom.querySelector(
      ".account-status__text"
    );

    let remainingDayEl = accountStatusText.querySelector(".remaining-day");

    let remainingMoneyEl = accountStatusDom.querySelector(".remaining-money");

    let lastPercent =
      (accountData[index].spentMoneyForMonth / accountData[index].baseAmount) *
      100;

    let remainingMoney =
      accountData[index].baseAmount - accountData[index].spentMoneyForMonth;

    progressbar.style.width = `${lastPercent}%`;
    verticalbar.style.left = `${lastPercent}%`;

    remainingDayEl.innerText = `${remainingDay}`;
    remainingMoneyEl.innerText = `${remainingMoney}`;
  });
}

function printChart() {
  const expenseManagements = document.querySelectorAll(".expense-management");

  expenseManagements.forEach((expenseManagement, index) => {
    let labelsArr = bindDataByDate(accountData[index].transactionList).map(
      (dayList) => {
        return dayList[0].date;
      }
    );

    let dataArr = bindDataByDate(accountData[index].transactionList).map(
      (dayList) => {
        let sum = 0;
        dayList.forEach((day) => {
          if (day.income === "out") {
            sum += day.price;
          }
        });
        return sum;
      }
    );

    const ctx = document.querySelectorAll("#myChart")[index].getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labelsArr,
        datasets: [
          {
            label: "일간 리포트",
            data: dataArr,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // 라운드 차트

    let rountChartLabelArr = [];
    accountData[index].transactionList.forEach((dayList) => {
      if (!rountChartLabelArr.includes(dayList.classify)) {
        rountChartLabelArr.push(dayList.classify);
      }
    });

    let rountChartDataArr = rountChartLabelArr.map((label) => {
      let sum = 0;
      accountData[index].transactionList.forEach((dayList) => {
        if (dayList.classify === label) {
          sum += dayList.price;
        }
      });
      return sum;
    });

    // myChart.destroy();

    const data = {
      labels: rountChartLabelArr,
      datasets: [
        {
          label: "My First Dataset",
          data: rountChartDataArr,
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    };

    const config = {
      type: "doughnut",
      data: data,
    };

    // myChart = new Chart(document.getElementById("myRoundChart"), config);
  });
}
