import React, { useState, useEffect, ChangeEvent } from 'react'
import { ibgeApi } from './services/api'

type Municipio = {
  id: number
  nome: string
}

type Estado = Municipio & {
  sigla: string
}

function App() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])

  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const [municipioSelecionado, setMunicipioSelecionado] = useState('')

  const loadEstados = async () => {
    const { data } = await ibgeApi.get<Estado[]>('/estados')
    data.sort((a, b) => a.sigla.localeCompare(b.sigla))
    setEstados(data)
  }

  const loadMunicipios = async (UF: string) => {
    const { data } = await ibgeApi.get<Municipio[]>(`/estados/${UF}/municipios`)
    data.sort((a, b) => a.nome.localeCompare(b.nome))
    setMunicipios(data)
  }

  /*
    useEffect não pode ser async
      useEffect(async () => {}, []) 

    então você precisa definir uma função async antes e depois invocá-la
    ela pode ser feita tanto dentro quanto fora do useEffect, dependendo se será
    reutilizada ou não

    você também pode utilizar .then, vai do gosto do freguês

    normalmente quando se tem um array vindo da api, você cria 3 states, ex:
      - products: []
      - loadingProducts: boolean
      - errorProducts: string
    dai você pode renderizar um spinner enquanto estiver carregando ou mostrar
    uma mensagem de erro se houver

    existe uma biblioteca muito boa isso:
    https://react-query.tanstack.com/
  */
  useEffect(() => {
    // carrego os estados assim que o componente montar em tela
    loadEstados()
  }, [])

  useEffect(() => {
    // só posso carregar os municípios se eu tiver o estado selecionado
    if (estadoSelecionado.length) loadMunicipios(estadoSelecionado)
  }, [estadoSelecionado])

  const onEstadoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // se eu mudar o estado, devo limpar o município
    // afinal, não existe São José dos Campos no Acre
    setMunicipioSelecionado('')
    setEstadoSelecionado(event.target.value)
  }

  const onMunicipioChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMunicipioSelecionado(event.target.value)
  }

  const onResetClick = () => {
    setMunicipioSelecionado('')
    setEstadoSelecionado('')
  }

  return (
    <main>
      <h1>
        Exemplo de <code>useEffect</code>
      </h1>

      <section>
        <fieldset>
          <legend>Selecionar localização</legend>

          <div>
            <label htmlFor="uf">UF</label>
            <select
              name="uf"
              id="uf"
              onChange={onEstadoChange}
              value={estadoSelecionado}
            >
              <option value="" defaultValue="" disabled>
                Selecionar...
              </option>
              {estados.map(({ sigla }) => (
                <option key={sigla} value={sigla}>
                  {sigla}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="municipio">Municipio</label>
            <select
              name="municipio"
              id="municipio"
              onChange={onMunicipioChange}
              value={municipioSelecionado}
            >
              <option value="" defaultValue="" disabled>
                Selecionar...
              </option>
              {municipios.map(({ id, nome }) => (
                <option key={id} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <h2>Localização</h2>
        {/* renderização condicional */}

        {!estadoSelecionado && <p>Por favor, selecione um Estado!</p>}

        {!municipioSelecionado && <p>Por favor, selecione um Município!</p>}

        {estadoSelecionado && municipioSelecionado && (
          <p>
            Foi selecionado:{' '}
            <strong>
              {estadoSelecionado} / {municipioSelecionado}
            </strong>
          </p>
        )}

        <button onClick={onResetClick} style={{ border: '1px solid #333' }}>
          Reset
        </button>
      </section>
    </main>
  )
}

export default App
