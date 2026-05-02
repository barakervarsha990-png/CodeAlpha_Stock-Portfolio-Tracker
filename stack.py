# 📊 Advanced Stock Portfolio Tracker

print("📈 Welcome to Smart Stock Portfolio Tracker 💰\n")

# Hardcoded stock prices (buying price)
stock_prices = {
    "AAPL": 180,
    "TSLA": 250,
    "GOOGL": 140,
    "AMZN": 130,
    "MSFT": 300
}

# Simulated current prices (for profit/loss)
current_prices = {
    "AAPL": 200,
    "TSLA": 240,
    "GOOGL": 150,
    "AMZN": 135,
    "MSFT": 310
}

portfolio = {}
total_investment = 0
total_current_value = 0

# 📥 User Input
while True:
    stock = input("Enter stock name (or 'done' to finish): ").upper()

    if stock == "DONE":
        break

    if stock not in stock_prices:
        print("❌ Stock not available. Try again!")
        continue

    try:
        quantity = int(input(f"Enter quantity for {stock}: "))
        if quantity <= 0:
            print("❌ Quantity must be positive!")
            continue
    except:
        print("❌ Invalid input! Enter a number.")
        continue

    portfolio[stock] = portfolio.get(stock, 0) + quantity

# 📊 Display Portfolio
print("\n📋 Your Portfolio Summary:\n")

for stock, quantity in portfolio.items():
    buy_price = stock_prices[stock]
    curr_price = current_prices[stock]

    investment = buy_price * quantity
    current_value = curr_price * quantity
    profit_loss = current_value - investment

    total_investment += investment
    total_current_value += current_value

    print(f"📌 {stock}")
    print(f"   Shares: {quantity}")
    print(f"   Buy Price: ${buy_price}")
    print(f"   Current Price: ${curr_price}")
    print(f"   Investment: ${investment}")
    print(f"   Current Value: ${current_value}")

    if profit_loss >= 0:
        print(f"   📈 Profit: ${profit_loss}\n")
    else:
        print(f"   📉 Loss: ${abs(profit_loss)}\n")

# 📊 Final Summary
net_profit = total_current_value - total_investment

print("💼 Overall Summary:")
print(f"💰 Total Investment: ${total_investment}")
print(f"📊 Current Value: ${total_current_value}")

if net_profit >= 0:
    print(f"📈 Net Profit: ${net_profit}")
else:
    print(f"📉 Net Loss: ${abs(net_profit)}")

# 💾 Save Option
save = input("\nDo you want to save result to file? (yes/no): ").lower()

if save == "yes":
    file_type = input("Enter file name or type (.txt/.csv): ").lower()

    if "txt" in file_type:
        filename = file_type if file_type.endswith(".txt") else "portfolio.txt"

        with open(filename, "w") as f:
            f.write("Stock Portfolio Report\n\n")
            for stock, quantity in portfolio.items():
                f.write(f"{stock}: {quantity} shares\n")
            f.write(f"\nTotal Investment: {total_investment}")
            f.write(f"\nCurrent Value: {total_current_value}")
            f.write(f"\nNet Profit/Loss: {net_profit}")

        print(f"✅ Saved as {filename}")

    elif "csv" in file_type:
        filename = file_type if file_type.endswith(".csv") else "portfolio.csv"

        with open(filename, "w") as f:
            f.write("Stock,Quantity,Buy Price,Current Price,Investment,Current Value,Profit/Loss\n")

            for stock, quantity in portfolio.items():
                buy = stock_prices[stock]
                curr = current_prices[stock]

                f.write(f"{stock},{quantity},{buy},{curr},{buy*quantity},{curr*quantity},{(curr-buy)*quantity}\n")

            f.write(f"\nTotal,,,{total_investment},{total_current_value},{net_profit}")

        print(f"✅ Saved as {filename}")

    else:
        print("❌ Invalid file type!")

print("\n🎉 Thank you for using Smart Stock Tracker!")