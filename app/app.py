import streamlit as st
import pandas as pd
import investpy as ip
from datetime import datetime, timedelta
import plotly.graph_objs as go

countries = ['brazil', 'united states'] #os paises que serão analisados 
intervals = ['Daily', 'Weekly', 'Monthly'] #os intervalos que o usuario pode escolher na visualização dos dados

start_date = datetime.today() - timedelta(days=30)
end_date = (datetime.today())

#função que pega os dados na biblioteca
@st.cache
def consulta_acao(stock, country, from_date, to_date, interval):
    df = ip.get_stock_historical_data(stock = stock, country = country, from_date = from_date, to_date = to_date, interval = interval)
    return df

#função para formatar a data
def format_date(dt, format = '%d/%m/%Y'):
    return dt.strftime(format)

#função que faz o grafico
def plotCandleStick (df, acao = 'ticket'):
    tracel = {
        'x': df.index,
        'open': df.Open,
        'close': df.Close,
        'high': df.High,
        'low': df.Low,
        'type': 'candlestick',
        'name': acao,
        'showlegend': False
    }
    data = [tracel]
    layout = go.Layout()

    fig = go.Figure(data = data, layout = layout)
    return fig

#parte interativa da barra lateral
barra_lateral = st.sidebar.empty()

country_select = st.sidebar.selectbox("Selecione o país: ", countries)

acoes = ip.get_stocks_list(country=country_select) 

stock_select = st.sidebar.selectbox("Selecione o ativo: ", acoes)

from_date = st.sidebar.date_input('De:', start_date)
to_date = st.sidebar.date_input('Para:', end_date)

interval_select = st.sidebar.selectbox("Selecione o intervalo: ", intervals)

carregar_dados = st.sidebar.checkbox('Carregar dados')


#parte central do programa, que mostra os dados
st.title('Stock Monitor')

st.header('Ações')

st.subheader('Visualização gráfica')

grafico_candle = st.empty()
grafico_line = st.empty()


#data final não pode ser maior que data inicial
if from_date > to_date:
    st.sidebar.error('Data de inicio maior do que data final')
else: #criando os graficos
    df = consulta_acao(stock_select, country_select, format_date(from_date), format_date(to_date), interval_select)
    try:
        fig = plotCandleStick(df)
        grafico_candle = st.plotly_chart(fig)
        grafico_line = st.line_chart(df.Close)

        #caso clique na opção de carregar dados
        if carregar_dados:
            st.subheader('Dados')
            dados = st.dataframe(df)
    except Exception as e:
        st.error(e)




