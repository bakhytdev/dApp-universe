//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
Контракт Wallet, который содержит
словарь (address => uint256) balances с счетами пользователей на этом контракте

и функции
addBalance()
    • для пополнения счёта на контракте

transferEth(address recipient, uint256 value)
    • отправляет value эфира со счёта balances[msg.sender] на счёт balances[recipient] в контракте

withdraw(uint256 value)
    • выводит value эфира со счёта  balances[msg.sender] на адрес msg.sender
*/
contract T35_3_Wallet {
    receive() external payable {}

    mapping(address => uint256) public balances;

    modifier checkBalance(uint256 _value) {
        require(balances[msg.sender] >= _value, "Balance is not enough");
        _;
    }

    function addBalance() public payable {
        balances[msg.sender] += msg.value;
    }

    function transferEth(address _recipient, uint256 _value) public virtual checkBalance(_value) {
        balances[msg.sender] -= _value;
        balances[_recipient] += _value;
    }

    function withdrawal(uint256 _value) public virtual checkBalance(_value) returns (bool) {
        balances[msg.sender] -= _value;
        return payable(msg.sender).send(_value);
    }
}

/*
Контракт Bank, который содержит
Структуру вклада
Stake {
    uint256 target; - целевая сумма вклада
    uint256 balance; - текущая сумма на вкладе
}
словарь (address => Stake)stakes с вкладами пользователей на этом контракте

и функции
addStake(uint256 target)payable
    • для создания/изменения/пополнения вклада на контракте
    • Если пользователь уже создал вклад, то создать ещё один вклад он не может
    • Если вклад создан то значение target переданное в функцию должно быть не меньше значения target в вкладе. Если значение target переданное в функцию больше значения target в вкладе, то это значение обновляется
    • msg.value зачисляется в значение balance в вкладе

unstake()
    • Если значение balance меньше значения target в вкладе - выбрасывает ошибку
    • Выводит весь вклад на адрес msg.sender
*/
contract T35_3_Bank {
    struct Stake {
        uint256 target;
        uint256 balance; 
    }

    mapping(address => Stake) public stakes;

    function addStake(uint256 _target) public payable {
        require(stakes[msg.sender].target <= _target);
        if (_target > stakes[msg.sender].target) {
            stakes[msg.sender].target = _target;
        }
        stakes[msg.sender].balance += msg.value;
    }

    function unStake() public virtual returns (bool) {
        require(stakes[msg.sender].balance >= stakes[msg.sender].target);
        uint256 _balance = stakes[msg.sender].balance;
        delete stakes[msg.sender];
        return payable(msg.sender).send(_balance);
    }
}

/*
Напишите контракт Credit, который является наследником контрактов Wallet и  Bank
Этот контракт позволяет пользователям(далее - клиентам) получать кредит

Кредит выдаётся из собственных средств контракта, то есть не из тех средств, что относятся счетам balances и вкладам stakes. То есть на контракте должны быть средства, внесённые владельцем контракта, либо полученные в качестве процентов из ранее выданных кредитов. Это необходимо, что пользователи могли в любое время вывести свои средства со счетов и/или из вкладов, не столкнувшись с тем, что на контракте не хватает средств
Кредит пересылается на адрес клиента, при этом на контракте должен остаться залог, размер которого равен 2 суммам кредита.
Залогом может быть счёт клиента на контракте balances или его вклад или и то и другое.
Пока кредит не погашен, клиент не может вывести из контракта залог.
В контракте установлен стационарный процент по кредиту, это значение должно быть установлено при деплое контракта и не должно менятся.
Проценты по кредиту начисляются каждые 30 дней на остаток долга по кредиту. Таким образом каждые 30 дней сумма долга увеличивается по формуле:
bail = bail + bail * percent / 100;
При начислении процентов и пересчёта оставшегося долга, пересчитывается залог. Залог всегда равен удвоенной сумме остатка долга по кредиту
debt = bail * 2;
Кредит выдаётся на 12 месяцев. Месяцем считается период в 30 дней
Если кредит не погашен в течение 12 месяцев или платежи не поступают более 4 месяцев, владелец контракта Credit вправе аннулировать кредит и забрать сумму залога из счёта и/или вклада клиента

Также необходимо:

написать функцию для вывода средств со счёта банка на счёт владельца контракта

И переопределить функции transferEth(), withdraw() и unstake() таким образом, чтобы при выводе средств со счёта/ вклада или пересылки со счёта на счёт, у клиента суммарно на счету и/или вкладе оставалась сумма не меньше, чем залог по его кредиту(если у него есть кредит)

Структуру данных и возможные дополнительные функции для реализации задания необходимо продумать самим

Сопроводите ваш код подробными комментариями с объяснениями что как и зачем вы делаете!
*/
contract T35_3_Credit is T35_3_Wallet, T35_3_Bank {
    uint256 public percent; //процентная ставка
    uint256 public bankBalance; //собственные стредства банка
    uint256 public creditCount; //количество кредитов
    address owner;

    modifier checkOwner() {
        require(msg.sender == owner, "You a not owner");
        _;
    }
    
    struct Credit { //структура кредита
        uint256 id; //идентификатор кредита
        uint256 bail; //долг
        uint256 debt; //залог
        uint256 time; //время взятия кредита
        uint8 lastPay; //последний месяц выплаты по кредиту
    }

    mapping(uint256 => address) public borrowers;
    mapping(address => Credit) public credits;

    constructor(uint256 _percent) payable {
        percent = _percent;
        owner = msg.sender;
        bankBalance = msg.value;
    }

    /*
    • функция для получения кредита
    • для получения кредита необходим залог. 
        Сумма эфира на счёте и вкладе клиента в контракте, 
        должна быть минимум в два раза больше суммы получаемого кредита bail
    • bail эфира пересылается на адрес msg.sender 
    */
    function getCredit(uint256 _bail) public {
        require(credits[msg.sender].bail == 0);
        require(bankBalance >= _bail);
        require(balances[msg.sender] + stakes[msg.sender].balance >= _bail * 2);

        creditCount++;
        credits[msg.sender] = Credit({
            id: creditCount,
            bail: _bail,
            debt: _bail * 2,
            time: block.timestamp,
            lastPay: 0
        });

        borrowers[creditCount] = msg.sender;
        bankBalance -= _bail;
        payable(msg.sender).transfer(_bail);
    }

    /*
    • функция для погашения кредита
    • перед погашением кредита происходит перерасчёт оставшегося долга. Для этого необходимо определить когда совершался последний платёж и начислить проценты на долг.
    • если сумма msg.value больше или равна, то долг погашается и кредит закрывается. При этом, если msg.value больше оставшегося долга bail, то разница зачисляется на счёт клиента bal
    • если сумма msg.value меньше, чем оставшийся долг bail, то долг уменьшается на msg.value и происходит перерасчёт залога debt
    */
    function repayLoan() public payable {
        require(msg.value > 0);
        require(credits[msg.sender].bail != 0);

        Credit memory _credit = credits[msg.sender];

        uint8 _month = uint8((block.timestamp - _credit.time) / 30 days);

        for(uint256 i = 0; i < _month - _credit.lastPay; i++) {
            _credit.bail += _credit.bail * percent / 100;
        }

        if (msg.value >= _credit.bail) {
            bankBalance += _credit.bail;
            balances[msg.sender] += msg.value - _credit.bail;

            if (_credit.id != creditCount) {
                credits[borrowers[creditCount]].id = _credit.id;
                borrowers[_credit.id] = borrowers[creditCount];
            }

            delete credits[msg.sender];
            delete borrowers[creditCount];

            creditCount--;
        } else {
            bankBalance += msg.value;
            _credit.bail -= msg.value;
            _credit.debt = _credit.bail * 2;
            _credit.lastPay = _month;
            credits[msg.sender] = _credit;
        }
    }

    /*
    • функция перерасчёта кредита
    • перерасчитывает сумму оставшегося долга и залога по кредиту взятому на адрес debtor
    • возвращает структуру со всей информацией по кредиту
    */
    function recalculation(address _debtor) public returns (Credit memory) {
        Credit memory _credit = credits[_debtor];

        if (_credit.bail != 0) {
            uint8 _month = uint8((block.timestamp - _credit.time) / 30 days);

            for(uint256 i = 0; i < _month - _credit.lastPay; i++) {
                _credit.bail += _credit.bail * percent / 100;
            }

            _credit.debt = _credit.bail * 2;
            credits[_debtor] = _credit;
        }

        return _credit;
    }

    /*
    • функция закрытия просроченных кредитов
    • может вызывать только владелец контракта Credit
    • можно закрыть только тот кредит, по которому просрочено время выплаты(12 месяцев), либо платежи не поступали более 4 месяцев
    • производит перерасчёт оставшегося долга и залога
    • если залог больше, чем сумма счёта и вклада клиента, то его счёт и вклад обнуляются, а все имеющиеся на них средства идут в счёт банка
    • если залог меньше, чем сумма счёта и вклада, то из счёта и/или вклада вычитается сумма равная залогу. эти средства идут в счёт банка
    • после этого кредит закрывается
    */
    function closeCredit(address _debtor) public checkOwner {
        Credit memory _credit = credits[_debtor];
        require(_credit.bail != 0, "Credit repaid");
        uint8 _month = uint8((block.timestamp - _credit.time) / 30 days);
        require((_month > 12) || (_month - _credit.lastPay) > 4, "Credit is not overdue yet");

        for(uint256 i = 0; i < _month - _credit.lastPay; i++) {
            _credit.bail += _credit.bail * percent / 100;
        }

        _credit.debt = _credit.bail * 2;

        if (_credit.debt > balances[_debtor] + stakes[_debtor].balance) {
            bankBalance += balances[_debtor] + stakes[_debtor].balance;
            balances[_debtor] = 0;
            stakes[_debtor].balance = 0;
        } else if (balances[_debtor] > _credit.debt) {
            balances[_debtor] -= _credit.debt;
            bankBalance += _credit.debt;
        } else {
            bankBalance += _credit.debt;
            _credit.debt -= balances[_debtor];
            balances[_debtor] = 0;
            stakes[_debtor].balance -= _credit.debt;
        }

        if (_credit.id != creditCount) {
            credits[borrowers[creditCount]].id = _credit.id;
            borrowers[_credit.id] = borrowers[creditCount];
        }

        delete credits[_debtor];
        delete borrowers[creditCount];

        creditCount--;
    }

    /*
    возвращает список всех незакрытых кредитов
    */
    function getCredits() external view checkOwner returns (Credit[] memory) {
        Credit[] memory _credits = new Credit[](creditCount);
        for(uint256 i = 0; i < creditCount; i++) {
            _credits[i] = credits[borrowers[i + 1]];
        }
        return _credits;
    }

    function checkDelta(uint256 _value) internal view {
        uint256 _delta = balances[msg.sender] + stakes[msg.sender].balance - _value;
        require(_delta >= credits[msg.sender].debt, "There are not enough funds to bail you out");
    }

    function transferEth(address _recipient, uint256 _value) public override checkBalance(_value) {
        recalculation(msg.sender);
        checkDelta(_value);
        balances[msg.sender] -= _value;
        balances[_recipient] += _value;
    }

    function withdrawal(uint256 _value) public override checkBalance(_value) returns (bool) {
        recalculation(msg.sender);
        checkDelta(_value);
        balances[msg.sender] -= _value;
        return payable(msg.sender).send(_value);    
    }

    function unStake() public override returns (bool) {
        uint256 _balance = stakes[msg.sender].balance;
        require(_balance >= stakes[msg.sender].target, "Target not met");
        recalculation(msg.sender);
        require(balances[msg.sender] >= credits[msg.sender].debt, "There are not enough funds to bail you out");
        stakes[msg.sender].balance = 0;
        stakes[msg.sender].target = 0;
        return payable(msg.sender).send(_balance);
    }
}