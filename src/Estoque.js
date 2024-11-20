import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const Estoque = ({ produtos }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque da Adega</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.produtoContainer}>
            <Text style={styles.produtoText}>
              {item.nome} - {item.tipo} - Qtd: {item.quantidade} - R${item.preco}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  produtoContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  produtoText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Estoque;
