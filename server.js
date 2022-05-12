const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//chave
const JWT_SECRET = 'sdjkfmaçouavsoljçab24865321as21asask'

//conectando ao banco de dados
mongoose.connect('mongodb+srv://admin:12345@cluster0.8007k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())


//logando usuario
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean() //procura no banco de dados o nome

	if (!user) {
		return res.json({ status: 'error', error: 'Nome ou Senha invalidas' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// nome e senha corretas...

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Nome ou usuário inválido' })
})


//registrando usuario
app.post('/api/register', async (req, res) => {
	const { username, password: plainTextPassword, cpassword: plainTextcPassword } = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Nome inválido' })
	}


	//conferindo se senha pode ser salva
	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Senha inválida' })
	}

	//caso senha menor que 5
	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Senha muito pequena, coloque no minimo 6 caracteres'
		})
	}

	if(plainTextPassword != plainTextcPassword){
		return res.json({ status: 'error', error: 'A senha e a confirmação precisam ser iguais!' })
	}

	const password = await bcrypt.hash(plainTextPassword, 10)


	//criando o usuario
	try {
		const response = await User.create({
			username,
			password
		})
		console.log('Usuário criado com sucesso: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicançao de chave
			return res.json({ status: 'error', error: 'Usuário já em uso' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})

app.listen(9999, () => {
	console.log('Sever aberto na porta 9999')
})
