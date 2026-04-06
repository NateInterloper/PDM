import { View } from 'react-native';
import DespesaLista from "./DespesaLista";
import DespesaSumario from "./DespesaSumario";

function DespesaSaida({despesas, periodo}) {
    return (
        <View>
            <DespesaSumario despesas={despesas} periodo={periodo}/>
            <DespesaLista despesas={despesas}/>
        </View>
    )
}

export default DespesaSaida