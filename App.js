import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Criando o Stack Navigator para navegação entre as telas
const Stack = createStackNavigator();

// Tela Inicial com animações e ícones interativos
function TelaInicial({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Título atualizado para "Bem-vindo à Adega" */}
      <Text style={styles.titulo}>Bem-vindo à Adega</Text>

      <Animatable.View
        style={styles.botoesContainer}
        animation="bounceInUp"
        iterationCount={1}
      >
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('CadastroProduto')}
        >
          <Ionicons name="add-circle" size={50} color="#4CAF50" />
          <Text style={styles.botaoTexto}>Cadastrar Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('Estoque')}
        >
          <Ionicons name="archive" size={50} color="#FF5722" />
          <Text style={styles.botaoTexto}>Ver Estoque</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View
        style={styles.botaoFlutuanteContainer}
        animation="fadeInUp"
        delay={1000}
      >
        <TouchableOpacity
          style={styles.botaoFlutuante}
          onPress={() => navigation.navigate('CadastroProduto')}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

// Tela de cadastro de produto com campos de entrada iniciando do meio
function CadastroProduto({ navigation }) {
  const [nomeProduto, setNomeProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');

  const validarFormulario = () => {
    if (!nomeProduto || !quantidadeProduto || !precoProduto) {
      alert('Todos os campos são obrigatórios!');
      return false;
    }
    if (isNaN(quantidadeProduto) || parseInt(quantidadeProduto) <= 0) {
      alert('A quantidade deve ser um número positivo!');
      return false;
    }
    if (isNaN(precoProduto) || parseFloat(precoProduto) <= 0) {
      alert('O preço deve ser um número válido e maior que zero!');
      return false;
    }
    return true;
  };

  const salvarProduto = async () => {
    if (validarFormulario()) {
      const novoProduto = {
        id: Math.random().toString(),
        nome: nomeProduto,
        quantidade: parseInt(quantidadeProduto),
        preco: parseFloat(precoProduto),
      };

      try {
        let produtosSalvos = await AsyncStorage.getItem('@produtos_key');
        produtosSalvos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
        produtosSalvos.push(novoProduto); // Adiciona o novo produto à lista

        await AsyncStorage.setItem('@produtos_key', JSON.stringify(produtosSalvos));
        navigation.navigate('Estoque');
      } catch (erro) {
        console.error('Erro ao salvar produto:', erro);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tituloFormulario}>Nome do Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={nomeProduto}
        onChangeText={setNomeProduto}
      />
      <Text style={styles.tituloFormulario}>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantidadeProduto}
        onChangeText={setQuantidadeProduto}
        keyboardType="numeric"
      />
      <Text style={styles.tituloFormulario}>Preço</Text>
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={precoProduto}
        onChangeText={setPrecoProduto}
        keyboardType="numeric"
      />
      <Button title="Cadastrar Produto" onPress={salvarProduto} />
    </View>
  );
}

// Tela de estoque para visualizar produtos cadastrados
function Estoque({ navigation }) {
  const [produtos, setProdutos] = useState([]);

  const carregarProdutos = async () => {
    try {
      const produtosSalvos = await AsyncStorage.getItem('@produtos_key');
      if (produtosSalvos) {
        setProdutos(JSON.parse(produtosSalvos));
      }
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const excluirProduto = (id) => {
    Alert.alert(
      'Excluir Produto',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              let produtosSalvos = await AsyncStorage.getItem('@produtos_key');
              produtosSalvos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
              const produtosAtualizados = produtosSalvos.filter(produto => produto.id !== id);

              await AsyncStorage.setItem('@produtos_key', JSON.stringify(produtosAtualizados));
              carregarProdutos();
            } catch (erro) {
              console.error('Erro ao excluir produto:', erro);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.produtoContainer}>
      <Text style={styles.produtoNome}>{item.nome}</Text>
      <Text>Quantidade: {item.quantidade}</Text>
      <Text>Preço: R${item.preco.toFixed(2)}</Text>
      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => navigation.navigate('EditarProduto', { produto: item })}
        >
          <Text style={styles.textoBotao}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={() => excluirProduto(item.id)}
        >
          <Text style={styles.textoBotao}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

// Tela para editar um produto
function EditarProduto({ route, navigation }) {
  const { produto } = route.params;
  const [nomeProduto, setNomeProduto] = useState(produto.nome);
  const [quantidadeProduto, setQuantidadeProduto] = useState(produto.quantidade.toString());
  const [precoProduto, setPrecoProduto] = useState(produto.preco.toString());

  const editarProduto = async () => {
    if (!nomeProduto || !quantidadeProduto || !precoProduto) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    if (isNaN(quantidadeProduto) || parseInt(quantidadeProduto) <= 0) {
      alert('A quantidade deve ser um número positivo!');
      return;
    }
    if (isNaN(precoProduto) || parseFloat(precoProduto) <= 0) {
      alert('O preço deve ser um número válido e maior que zero!');
      return;
    }

    const produtoAtualizado = { ...produto, nome: nomeProduto, quantidade: parseInt(quantidadeProduto), preco: parseFloat(precoProduto) };

    try {
      let produtosSalvos = await AsyncStorage.getItem('@produtos_key');
      produtosSalvos = produtosSalvos ? JSON.parse(produtosSalvos) : [];

      const index = produtosSalvos.findIndex(p => p.id === produto.id);
      if (index !== -1) {
        produtosSalvos[index] = produtoAtualizado;
        await AsyncStorage.setItem('@produtos_key', JSON.stringify(produtosSalvos));
        navigation.goBack();
      }
    } catch (erro) {
      console.error('Erro ao editar produto:', erro);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tituloFormulario}>Nome do Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={nomeProduto}
        onChangeText={setNomeProduto}
      />
      <Text style={styles.tituloFormulario}>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantidadeProduto}
        onChangeText={setQuantidadeProduto}
        keyboardType="numeric"
      />
      <Text style={styles.tituloFormulario}>Preço</Text>
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={precoProduto}
        onChangeText={setPrecoProduto}
        keyboardType="numeric"
      />
      <Button title="Salvar Alterações" onPress={editarProduto} />
    </View>
  );
}

// Navegação das telas
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial">
        <Stack.Screen name="TelaInicial" component={TelaInicial} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroProduto" component={CadastroProduto} />
        <Stack.Screen name="Estoque" component={Estoque} />
        <Stack.Screen name="EditarProduto" component={EditarProduto} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  botaoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  botao: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  botaoTexto: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  botaoFlutuanteContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  botaoFlutuante: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 20,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '100%',
  },
  produtoContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    elevation: 3,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoEditar: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  botaoExcluir: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tituloFormulario: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
  },
});
