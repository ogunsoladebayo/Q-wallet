const axios = require('axios').default;
const converter = async (currentBalance, fromCurrency, toCurrency) => {
	// Convert current balance to new balance in new currency
	const conversionString = `${fromCurrency}_${toCurrency}`;
	await axios
		.get(
			`https://free.currconv.com/api/v7/convert?q=${conversionString}&compact=ultra&apiKey=${process.env.CURRCONV_API_KEY}`
		)
		.then((response) => {
			data = JSON.stringify(response.data);
			const rate = data.match(/[\d|,|.|\+]+/g)[0];
			newBalance = currentBalance * rate;
		})
		.catch((error) => {
			return next(
				new ErrorResponse(
					'Unable to change currency, please try again',
					500
				)
			);
		});
	return newBalance;
};

module.exports = converter;
