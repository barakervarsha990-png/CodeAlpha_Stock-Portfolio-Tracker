# 📈 Stock Portfolio Tracker

print("📊 Welcome to Stock Portfolio Tracker 💰\n")

# Hardcoded stock prices
stock_prices = {
    "AAPL": 180,
    "TSLA": 250,
    "GOOGL": 140,
    "AMZN": 130,
    "MSFT": 300
}

portfolio = {}
total_investment = 0

# User input
while True:
    stock = input("Enter stock name (or 'done' to finish): ").upper()
    
    if stock == "DONE":
        break
    
    if stock not in stock_prices:
        print("❌ Stock not available. Try again!")
        continue
    
    quantity = int(input(f"Enter quantity for {stock}: "))
    
    portfolio[stock] = quantity

# Calculation
print("\n📋 Your Portfolio:")
for stock, quantity in portfolio.items():
    price = stock_prices[stock]
    investment = price * quantity
    total_investment += investment
    
    print(f"📌 {stock} -> {quantity} shares × ${price} = ${investment}")

print("\n💵 Total Investment Value:", total_investment)

# Optional: Save to file
save = input("\nDo you want to save result to file? (yes/no): ").lower()

if save == "yes":
    file_type = input("Save as .txt or .csv? ").lower()
    
    if file_type == "txt":
        with open("portfolio.txt", "w") as f:
            f.write("Stock Portfolio\n")
            for stock, quantity in portfolio.items():
                f.write(f"{stock}: {quantity}\n")
            f.write(f"Total Investment: {total_investment}")
        print("✅ Saved as portfolio.txt")
    
    elif file_type == "csv":
        with open("portfolio.csv", "w") as f:
            f.write("Stock,Quantity,Price,Investment\n")
            for stock, quantity in portfolio.items():
                price = stock_prices[stock]
                f.write(f"{stock},{quantity},{price},{price * quantity}\n")
            f.write(f"\nTotal Investment,,,{total_investment}")
        print("✅ Saved as portfolio.csv")
    
    else:
        print("❌ Invalid file type!")

print("\n🎉 Thank you for using Stock Tracker!")