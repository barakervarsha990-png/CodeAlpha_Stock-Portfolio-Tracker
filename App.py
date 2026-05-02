from flask import Flask, render_template, request

app = Flask(__name__)

# Stock prices
stock_prices = {
    "AAPL": 180,
    "TSLA": 250,
    "GOOGL": 140,
    "AMZN": 130
}

# Store portfolio globally
portfolio = []

@app.route("/", methods=["GET", "POST"])
def index():
    global portfolio
    message = ""

    if request.method == "POST":
        stock = request.form["stock"].upper()
        quantity = int(request.form["quantity"])

        if stock in stock_prices:
            price = stock_prices[stock]
            investment = price * quantity

            # Add to portfolio list
            portfolio.append({
                "stock": stock,
                "quantity": quantity,
                "price": price,
                "investment": investment
            })

            message = "✅ Stock Added!"
        else:
            message = "❌ Invalid Stock!"

    return render_template("index.html", portfolio=portfolio, message=message)


# Save to file
@app.route("/save")
def save():
    with open("portfolio.txt", "w") as f:
        for item in portfolio:
            f.write(f"{item['stock']} - {item['quantity']} shares - ${item['investment']}\n")

    return "✅ Portfolio saved to portfolio.txt"


if __name__ == "__main__":
    app.run(debug=True)