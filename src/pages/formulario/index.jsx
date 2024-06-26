import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import { Container, Box, Title, Question, LabelContainer } from './styles';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/button';
import Date from '../../components/formDate';
import Input from '../../components/input';
import Dropzone from '../../components/dropzone';
import imageUpload from '../../services/imageUpload';
import api from '../../services/api';

const Form = () => {
    const [form, setForm] = useState({ date: '', user:'', shift: '', tool: [], plate: {}, actions:[], forActions:[], water:[], local:'', observation: '', imgs: []})
    const [data, setData] = useState({local:[], plate:[], tool:[], users:[]});
    const [allActivities, setAllActivities] = useState([]);
    const [dayOfWeek, setDayOfWeek] = useState('');

        const getData = async () => {
            try {
                const responses = await Promise.all([
                    api.get('/local/'),
                    api.get('/plate/'),
                    api.get('/tool/'),
                    api.get('/users/')
                ]);
                
                const [local, plate, tool, users] = responses.map(response => response.data);
                setData({ local, plate, tool, users });
                var all = plate.reduce((acc, plate) => acc.concat(plate.timeline.map(activity => activity.name)), [])
                setAllActivities(all)
            } catch (error) {
                //console.log(error);
                toast.error("Erro interno ao puxar os dados do formulário")
            }
          };

          const sendData = async () => {
              await window.scrollTo({
                  top: 0,
                  behavior: 'smooth' 
                });
            var images = await imageUpload(form.imgs);
            const response = await toast.promise(
                api.post('/form/create', {...form, imgs: images}),
                {
                  pending: 'Enviando formulário',
                  success: 'Formulário enviado com sucesso',
                  error: 'Erro interno ao enviar formulário'
                }
              );

              setForm({ date: '', user:'', shift: '', tool: [], plate: {}, actions:[], forActions:[], water:[], imgs: [], observation: ''});

          }

         useEffect(() => {getData()}, [])

    return (
        <Container>
			<ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                />
            <Box>
                <Title>
                    <h1>Controle de atividades Brasanitas</h1>
                    <h3>Com você, <span>pra valer.</span></h3>
                </Title>

                <Question>
                    <LabelContainer>
                        <label>Atividade realizada em ?</label>
                        <span>*</span>
                    </LabelContainer>
                    <Date autoDate onChange={(date, day) => setForm({...form, date}) & setDayOfWeek(day) & console.log(date)} width='40vw' color='#262626'/>
                </Question>

                <Question>
                    <LabelContainer>
                        <label>Selecione o responsável pela atividade</label>
                        <span>*</span>
                    </LabelContainer>
                    <Dropdown  oneSelect options={data.users ? data.users?.map(x => x?.name) : []} onChange={(user) => setForm({...form, user: user[0]})}  name={form.user ? form.user : 'Selecione'} width='40vw' color='#262626'/>
                </Question>

                <Question>
                    <LabelContainer>
                        <label>Realizou em qual turno ?</label>
                        <span>*</span>
                    </LabelContainer>
                    <Dropdown  oneSelect options={['diurno', 'noturno']} onChange={(shift) => setForm({...form, shift: shift[0]})} name={form.shift ? form.shift : 'Selecione'} width='40vw' color='#262626'/>
                </Question>

                <Question>
                    <LabelContainer>
                        <label>Realizou em qual local ?</label>
                        <span>*</span>
                    </LabelContainer>
                    <Dropdown  oneSelect options={data.local ? data.local?.map(x => x?.name) : []} onChange={(local) => setForm({...form, local: local[0]})} name={form.local ? form.local : 'Selecione'} width='40vw' color='#262626'/>
                </Question>

                <Question>
                    <LabelContainer>
                        <label>Quais ferramentas foram usadas durante a atividade ?</label>
                        <span>*</span>
                    </LabelContainer>
                    <Dropdown  options={data.tool ? data.tool?.map(x => x?.name) : []} onChange={(tool) => setForm({...form, tool})}  name={form.tool.length != 0 ? form.tool.join(', ') : 'Selecione'} width='40vw' color='#262626'/>
                </Question>

                <Question>
                    <LabelContainer>
                        <label>Selecione a placa do veículo</label>
                        <span>*</span>
                    </LabelContainer>
                    <Dropdown  oneSelect options={data.plate ? data.plate?.map(x => x?.name) : []} name={form.plate.name ? form.plate.name : 'Selecione'} onChange={(plate, index) => setForm({...form, plate: {...data.plate[index], index}})}  width='40vw' color='#262626'/>
                </Question>

                <Question>
                    <LabelContainer>
                        <label>Atividades realizadas dentro do cronograma <span>({form.date} - {dayOfWeek})</span></label>
                    </LabelContainer>
                    <Dropdown options={form.plate?.timeline?.filter(activity => activity?.days?.includes(dayOfWeek))?.map(x => x?.name)} onChange={(actions) => setForm({...form, actions})}  name={form?.actions?.length != 0 ? form?.actions?.join(', ') : form.plate?.name ? 'Selecione' :'Selecione um veiculo antes de selecionar a atividade' }width='40vw'  color={form.plate?.name ? '#262626' : '#290006'}/>
                </Question>
                
                {
                    form.actions.map((item, index) => {
                        return (
                                <Question key={index}>
                                    <LabelContainer>
                                        <label>Quantidade de agua gasta na atividade <span className='waterSpan'>({item})</span></label>
                                        <span>*</span>
                                    </LabelContainer>
                                    <Dropdown  oneSelect options={[0, 5000, 10000, 15000, 20000, 25000]} onChange={(water) => setForm({...form, water: [...form.water, { action: item, water}]})} width='40vw'  color='#262626'/>
                                </Question>
                        )
                    })
                }

                <Question>
                    <LabelContainer>
                        <label>Atividades realizadas fora do cronograma</label>
                    </LabelContainer>
                    <Dropdown  options={allActivities} onChange={(forActions) => setForm({...form, forActions})}  name={form.forActions.length != 0 ? form.forActions.join(', ') : 'Selecione'}width='40vw'  color='#262626'/>
                </Question>
                {
                    form.forActions.map((item, index) => {
                        return (
                                <Question key={index}>
                                    <LabelContainer>
                                        <label>Quantidade de agua gasta na atividade <span className='waterSpan'>({item})</span></label>
                                        <span>*</span>
                                    </LabelContainer>
                                    <Dropdown  oneSelect options={[0, 5000, 10000, 15000, 20000, 25000]} onChange={(water) => setForm({...form, water: [...form.water, { action: item, water}]})} width='40vw'  color='#262626'/>
                                </Question>
                        )
                    })
                }
                <Question>
                    <LabelContainer>
                        <label>Observações</label>
                    </LabelContainer>
                    <Input placeholder='observação' value={form.observation} color={'#262626'} onInput={(x) => setForm({...form, observation: x})} />
                </Question>
                <Question>
                 <Dropzone value={form.imgs} setValue={(x) => setForm({...form, imgs: x})}/>
                </Question>
                <Button name={'ENVIAR'} center width='40vw' onButton={() => sendData()}/>


            </Box>

            <div className="transparent"></div>
            
        </Container>
    )
}

export default Form