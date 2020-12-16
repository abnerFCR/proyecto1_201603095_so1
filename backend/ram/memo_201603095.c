#include <linux/proc_fs.h>
#include <linux/seq_file.h> 
#include <asm/uaccess.h> 
#include <linux/hugetlb.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>   
#include <linux/fs.h>
#include <linux/sysinfo.h>
#define BUFSIZE  	1000

MODULE_DESCRIPTION("Modulo que obtiene informacion de y estadisticas de uso de la memoria RAM");
MODULE_AUTHOR("Abner Fernando Cardona Ramirez");
MODULE_LICENSE("GPL");

struct sysinfo informacion_sistema;

static int escribir_archivo(struct seq_file * archivo, void *v) {	
    si_meminfo(&informacion_sistema);
    long totalRam 	= (informacion_sistema.totalram * 4);
    long ramLibre 	= (informacion_sistema.freeram * 4 );
    seq_printf(archivo, "{\n");
    seq_printf(archivo, "\t\"totalRam\":\"%8lu\",\n", totalRam);
    seq_printf(archivo, "\t\"ramLibre\":\"%8lu\"\n", ramLibre);
    seq_printf(archivo, "}\n");
    /*
    seq_printf(archivo, "**********************************************\n");
    seq_printf(archivo, "*  CARNET: 201603095                       *\n");
    seq_printf(archivo, "*  NOMBRE: Abner Fernando Cardona Ramirez  *\n");
    seq_printf(archivo, "**********************************************\n");
    seq_printf(archivo, " MEMORIA TOTAL:        %8lu \tKB\t - %8lu \tMB\n",totalRam, totalRam / 1024);
    seq_printf(archivo, " MEMORIA LIBRE: :      %8lu \tKB\t - %8lu \tMB\n", ramLibre, ramLibre / 1024);
    seq_printf(archivo, " PORCENTAJE MEMORIA UTILIZADA:  %i %%\n", (ramLibre * 100)/totalRam) ;
    seq_printf(archivo, "***************************************************\n\n");
    */
    return 0;
}

static int al_abrir(struct inode *inode, struct  file *file) {
  return single_open(file, escribir_archivo, NULL);
}

static struct file_operations operaciones =
{    
    .open = al_abrir,
    .read = seq_read
};

static int inicializar(void)
{
    proc_create("memo_201603095", 0, NULL, &operaciones);
    printk(KERN_INFO "CARNET: 201603095\n");

    return 0;
}

static void finalizar(void)
{
    remove_proc_entry("memo_201603095", NULL);
    printk(KERN_INFO "Curso de Sistemas Operativos 1\n");
}
 
module_init(inicializar);
module_exit(finalizar); 