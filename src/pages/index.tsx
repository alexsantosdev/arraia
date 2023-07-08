import Head from 'next/head'
import { FormEvent, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { onValue, ref, set } from 'firebase/database'
import { FiMap, FiMapPin, FiAlertTriangle } from 'react-icons/fi'

import { database } from '../services/firebase'

import { Badge } from '@/components/Badge'
import { Checkbox } from '@/components/Checkbox'

import { platesList } from '@/utils/plates'

import styles from '@/styles/Home.module.scss'

type CompanionType = {
  name: string,
  rg: string
}

type GuestType = {
  name : string,
  typicalPlate: string,
  rg: string,
}

type Message = {
  visible: boolean,
  message: string,
}

export default function Home() {

  const [guests, setGuests] = useState(0)

  const [name, setName] = useState('')
  const [rg, setRG] = useState('')
  const [typicalPlate, setTypicalPlate] = useState('')
  const [companionName, setCompanionName] = useState('')
  const [companionRg, setCompanionRg] = useState('')
  const [companions, setCompanions] = useState<CompanionType[]>([])
  const [agreement, setAgreement] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [length, setLength] = useState(0)
  const [companionFormOpen, setCompanionFormOpen] = useState(false)
  const [guestsList, setGuestsList] = useState<GuestType[]>([])

  const [message, setMessage] = useState<Message>({} as Message)

  const [isConfirmed, setIsConfirmed] = useState(false)

  const formatRg = (value: string) => {
    // Remove qualquer caractere que não seja número ou "X"
    const onlyNumbersAndX = value.replace(/[^\dx]/gi, '')
  
    // Aplica a máscara do RG (XX.XXX.XXX-X)
    let formattedRg = onlyNumbersAndX.replace(
      /^(\d{2})(\d{3})(\d{3})([\dx])$/,
      '$1.$2.$3-$4'
    )
  
    return formattedRg
  }

  const handleChangeAgreement = (checked: boolean) => setAgreement(checked)

  const handleChangeCompanionForm = () => !companionFormOpen && setCompanionFormOpen(true)

  const handleAddCompanion = (e: FormEvent) => {
    e.preventDefault()

    const companion: CompanionType = {
      name: companionName,
      rg: companionRg
    }
    setCompanions([...companions, companion])
    setCompanionName('')
    setCompanionRg('')

    setCompanionFormOpen(false)

    return toast.success('Acompanhante adicionado')
  }

  const clearData = () => {
    setName('')
    setTypicalPlate('')
    setRG('')
    setCompanions([])
  }

  async function saveData() {
    const db = database
    let guestId = name.toLowerCase().trim()
    await set(ref(db, 'guests/' + guestId), {
      name: name,
      typicalPlate: typicalPlate,
      rg: rg
    })

    if(companions.length > 0) {
      companions.map(c => {
        let uniqueId = c.name.toLowerCase().trim()
        set(ref(db, 'companions/' + uniqueId), {
          name: c.name,
          rg: c.rg,
          guest_name: name
        })
      })
    }
  }

  const listGuests = async () => {
    let g = 0
  
    const db = database
  
    const guestRef = ref(db, 'guests')
    onValue(guestRef, snapshot => {
      const data: GuestType[] = snapshot.val() ?? {}
      const parsedData = Object.entries(data).map(([key, value]) => {
        return {
          name: value.name,
          typicalPlate: value.typicalPlate,
          rg: value.rg
        }
      })
  
      // const filtered = parsedData.filter(guest => guest.typicalPlate === "Curau")
      // console.log(filtered)
  
      g = parsedData.length
      setGuestsList(parsedData)
    })
  
    const companionRef = ref(db, 'companions')
    onValue(companionRef, snapshot => {
      const data: CompanionType[] = snapshot.val() ?? {}
      const parsedData = Object.entries(data).map(([key, value]) => {
        return {
          name: value.name,
          rg: value.rg
        }
      })
      g += parsedData.length

      setGuests(g)
      setLength(g)
    })
  } 

  async function handleConfirm(e: FormEvent) {
    e.preventDefault()

    if(name.trim() === '') {
      return setMessage({visible: true, message: 'Preencha o campo de nome.'})
    }

    if(rg.trim() === '') {
      return setMessage({visible: true, message: 'Preencha o campo de RG.'})
    }

    if(typicalPlate.trim() === '') {
      return setMessage({visible: true, message: 'Selecione um prato típico para levar.'})
    }

    if(!agreement) {
      return setMessage({visible: true, message: 'Por favor, marque a caixa de conscientização do rateio.'})
    }

    setConfirm(true)

    if(guests === 50) {
      return toast.error('Infelizmente a lista está cheia :(')
    }else {
      if(confirm) {
        toast.promise(
          saveData(),
          {
            loading: 'Estamos confirmando sua presença...',
            success: <b>Presença confirmada!</b>,
            error: <b>Não conseguimos confirmar sua presença :(</b>,
          }
        )

        // clearData()
        setIsConfirmed(true)

        listGuests()
      }
    }
  }

  useEffect(() => {
    listGuests()
  }, [guests, length])

  return (
    <>
      <Head>
        <title>Arraiá do P&D</title>
      </Head>

      <Toaster position='top-center' />

      <main className={styles.mainContainer}>
        <div className={styles.formContent}>
          <div className={styles.contentPanel}>
            {isConfirmed ? (
              <div className={styles.confirmedContent}>
                <img src='/images/confetti.gif' alt='Confetti' />
                <h2>Presença confirmada!</h2>
                <span>Tire print dessa tela, abaixo estão os dados do evento:</span>
                <div className={styles.eventContainer}>
                  <div className={styles.eventHeader}>
                    <h2>Informações do evento</h2>
                  </div>
                  <div className={styles.eventBody}>
                    <h2>15:00</h2>
                    <div className={styles.time}>
                      <span>GMT 03:00</span>
                      <span>Brasilia</span>
                    </div>
                  </div>
                  <div className={styles.eventFooter}>
                    <div className={styles.addresIcon}>
                      <FiMapPin color='var(--gray-900)' />
                    </div>
                    <span>Reserva da Mata - JUNDIAÍ / CONDOMÍNIO, PQ - Av. Nícola Accieri, 1130 - Corrupira, Jundiaí - SP</span>
                    <a target='_blank' href='https://www.google.com/maps/place/Reserva+da+Mata+-+JUNDIA%C3%8D+%2F+CONDOM%C3%8DNIO/@-23.1176202,-46.9221383,17z/data=!3m1!4b1!4m6!3m5!1s0x94cf2f23addbb079:0x68798f85b22b916!8m2!3d-23.1176252!4d-46.919558!16s%2Fg%2F11gblbxcd3?entry=ttu'>
                      <FiMap color='var(--blue-500)' />
                      Ver no mapa
                    </a>
                  </div>
                </div>
                <div className={styles.eventContainer}>
                  <div className={styles.eventHeader}>
                    <h2>Meus dados</h2>
                  </div>
                  <div className={styles.eventBody}>
                    <div className={styles.guestInfo}>
                      <h1>Convidado:</h1>
                      <span>{name}</span>
                      {companions.length > 0 && (
                        <>
                          <h1>Acompanhantes:</h1>
                          {companions.map(companion => {
                            return(
                              <span key={companion.rg}>{companion.name}</span>
                            )
                          })}
                        </>
                      )}
                      <h1>Prato típico:</h1>
                      <span>{typicalPlate}</span>
                    </div>
                  </div>
                  <div className={styles.eventFooter}>
                    <div className={styles.addresIcon}>
                      <FiAlertTriangle color='var(--gray-900)' />
                    </div>
                    <span style={{fontSize: '14px'}}>Atenção: Para auxílio do rateio é necessário que cada convidado (Exceto acompanhantes) deva fazer um Pix de R$ 25,00 para: (11) 98397-5237.</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <img src='/images/icon.png' alt='Arraiá do P&D' />
                <form>
                  <h2>Você está sendo convidado para o nosso Arraiá!</h2>
                  <span>Restam apenas {50 - length} de 50 vagas.</span>
                  {message.visible && <Badge type='error' baseText='Atenção' contentText={message.message} />}
                  <div className={styles.inputGroup}>
                    <label htmlFor='name'>Nome</label>
                    <input className={`${message.visible && styles.error}`} type='text' name='name' id='name' placeholder='Insira seu nome' value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor='rg'>RG</label>
                    <input className={`${message.visible && styles.error}`} type='text' name='rg' id='rg' placeholder='Insira seu RG' value={rg} onChange={e => setRG(formatRg(e.target.value))} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor='typicalPlate'>Prato típico</label>
                    <select name="typicalPlate" id="typicalPlate" onChange={e => setTypicalPlate(e.target.value)}>
                      <option value='' hidden>Selecione um prato para levar</option>
                      {platesList.map(plate => {
                        return(
                          <option value={plate} key={plate}>{plate} | {Object.entries(guestsList).map(([key, value]) => {
                            return {
                              name: value.name,
                              typicalPlate: value.typicalPlate,
                              rg: value.rg
                            }
                          }).filter(item => item.typicalPlate === plate).length} selecionados</option>
                        )
                      })}
                    </select>
                    {
                    Object.entries(guestsList).map(([key, value]) => {
                      return {
                        name: value.name,
                        typicalPlate: value.typicalPlate,
                        rg: value.rg
                      }
                    }).filter(item => item.typicalPlate === typicalPlate).length > 0 && <span style={{color: 'var(--red-500)'}}>Por favor, selecione outro prato.</span>}
                  </div>
                  {companions.length > 0 && (
                    <>
                      <hr />
                      <h2>Acompanhantes:</h2>
                      {companions.map(companion => {
                        return <span key={companion.rg}>{companion.name}</span>
                      })}
                    </>
                  )}
                  {companionFormOpen ? (
                    <>
                      <hr />
                      <div className={styles.inputGroup}>
                        <label htmlFor='companionName'>Nome do acompanhante</label>
                        <input className={`${message.visible && styles.error}`} type='text' name='companionName' id='companionName' placeholder='Insira o nome do acompanhante' value={companionName} onChange={e => setCompanionName(e.target.value)} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor='companionRg'>RG</label>
                        <input className={`${message.visible && styles.error}`} type='text' name='companionRg' id='companionRg' placeholder='Insira o RG do acompanhante' value={companionRg} onChange={e => setCompanionRg(formatRg(e.target.value))} />
                      </div>
                      <div className={styles.row}>
                        <button className={styles.cancelButton} onClick={() => setCompanionFormOpen(false)}>Cancelar</button>
                        <button className={styles.includeButton} onClick={handleAddCompanion}>Incluir</button>
                      </div>
                    </>
                  ) : (
                    <button onClick={handleChangeCompanionForm}>+ Adicionar acompanhante</button>
                  )}
                  <Checkbox checked={agreement} onChange={handleChangeAgreement} label='Estou ciente que para auxílio do rateio é necessário que cada convidado (Exceto acompanhantes) deva fazer um Pix de R$ 25,00 para: (11) 98397-5237.' />
                  <button className={styles.confirmButton} onClick={handleConfirm}>Confirmar presença!</button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* <main className={styles.mainContainer} style={{backgroundImage: `url(${bg.src})`, width: '100vw', height: 'max-content', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
        <div className={styles.contentContainer}>
          <h2>Boteco do Raymond <b>5.0</b></h2>
          <span>Você está sendo convidado para a primeira comemoração do ano, sua presença é muito importante.</span>
          <span className={styles.boldSpan}>Traga uma bebida da sua preferência e um kit churrasco, sua mesa já está reservada!</span>
          <div className={styles.formContainer}>
            <div className={styles.row}>
              <input type='text' placeholder='Digite seu nome' value={name} onChange={e => setName(e.target.value)} />
              <input type='text' placeholder='Seu telefone' value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className={styles.row}>
              <input type="text" placeholder='RG' value={rg} onChange={e => setRG(e.target.value)} />
              <select value={hasCompanion} onChange={e => setHasCompanion(e.target.value)}>
                <option value='' hidden>Possui acompanhante?</option>
                <option value='sim'>Sim</option>
                <option value='nao'>Não</option>
              </select>
            </div>

            {hasCompanion === 'sim' && <button className={styles.addGuess} onClick={addNewGuess}>Adicionar acompanhante</button> }
            {hasCompanion === 'sim' && companions.map((guessItem, index) => {
              return(
                <div className={styles.row}>
                  <input name='name' type='text' placeholder='Nome do acompanhante' value={guessItem.name} onChange={e => setCompanionItemValue(index, 'name', e.target.value)} />
                  <input type="text" placeholder='RG' value={guessItem.rg} onChange={e => setCompanionItemValue(index, 'rg', e.target.value)} />
                  <input name='phone' type='text' placeholder='Telefone' value={guessItem.phone} onChange={e => setCompanionItemValue(index, 'phone', e.target.value)} />
                </div>
              )
            })}
          </div>
          <p>Ao clicar em "Confirmar" você está ciente de que se você for <b>BEBER</b> não dirija, chame um <b>UBER</b>!</p>
          <button onClick={handleConfirm}>
            <img src="/images/beer-button.svg" alt="icon" />
            Confirmar presença
          </button>
          <h3>Restam apenas {50 - length} de 50 vagas.</h3>

          <div className={styles.address}>
            <img src="/images/map.svg" alt="map pin" />
            <span><a style={{color: '#2eb2ff'}} href="https://www.google.com/maps/place/Reserva+da+Mata+-+JUNDIA%C3%8D+%2F+CONDOM%C3%8DNIO/@-23.1176252,-46.9217467,17z/data=!3m1!4b1!4m5!3m4!1s0x94cf2f23addbb079:0x68798f85b22b916!8m2!3d-23.1176252!4d-46.919558" target="_blank">Av. Nicola Accieri, S/N - Condomínio 7763, Reserva da mata.</a> | 11/02 - 17h às 22h</span>
          </div>
        </div>
      </main> */}
    </>
  )
}